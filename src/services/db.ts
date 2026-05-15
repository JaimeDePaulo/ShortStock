import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Generic CRUD services
export const dbService = {
  async get(col: string, id: string) {
    try {
      const docRef = doc(db, col, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${col}/${id}`);
    }
  },

  async list(col: string, constraints: any[] = []) {
    try {
      const q = query(collection(db, col), ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, col);
    }
  },

  async set(col: string, id: string, data: any) {
    try {
      const docRef = doc(db, col, id);
      await setDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${col}/${id}`);
    }
  },

  async add(col: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, col), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, col);
    }
  },

  async update(col: string, id: string, data: any) {
    try {
      const docRef = doc(db, col, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${col}/${id}`);
    }
  },

  async delete(col: string, id: string) {
    try {
      const docRef = doc(db, col, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${col}/${id}`);
    }
  },

  onSnapshot(col: string, constraints: any[], callback: (data: any[]) => void) {
    const q = query(collection(db, col), ...constraints);
    return onSnapshot(q, 
      (snapshot) => {
        callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, col)
    );
  }
};

// Specialized service for stock movements
export const stockService = {
  async registerMovement(type: 'IN' | 'OUT', productId: string, quantity: number, price: number, extraData: any) {
    try {
      await runTransaction(db, async (transaction) => {
        const productRef = doc(db, 'products', productId);
        const productSnap = await transaction.get(productRef);
        
        if (!productSnap.exists()) {
          throw new Error("Produto não encontrado");
        }

        const currentStock = productSnap.data().currentStock || 0;
        const newStock = type === 'IN' ? currentStock + quantity : currentStock - quantity;

        if (type === 'OUT' && newStock < 0) {
          throw new Error("Saldo de stock insuficiente");
        }

        // Update product stock
        transaction.update(productRef, { currentStock: newStock, updatedAt: Timestamp.now() });

        // Add movement log
        const movementRef = doc(collection(db, 'movements'));
        transaction.set(movementRef, {
          type,
          productId,
          quantity,
          price,
          ...extraData,
          userId: auth.currentUser?.uid,
          date: Timestamp.now()
        });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'movements');
    }
  }
};
