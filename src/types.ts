export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR'
}

export interface UserSession {
  id: string;
  userId: string;
  email: string;
  timestamp: any;
  type: 'LOGIN';
}

export interface UserProfile {
  id: string; // Document ID (usually same as uid)
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: any;
  lastLogin?: any;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  description?: string;
  buyingPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  unit: string;
  supplierId?: string;
  imageUrl?: string;
  createdAt: any;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Movement {
  id: string;
  type: 'IN' | 'OUT';
  productId: string;
  quantity: number;
  price: number;
  partnerId?: string; // supplier for IN, customer for OUT
  date: any;
  observation?: string;
  userId: string;
  invoiceId?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  address?: string;
}

export interface Customer {
  id: string;
  name: string;
  contact?: string;
  address?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  products: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  date: any;
  status: string;
}
