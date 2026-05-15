/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { dbService } from '../services/db';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider: Inicializando monitoramento de estado de auth...");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("AuthProvider: Estado de Auth alterado:", user ? `Logado como ${user.email}` : "Deslogado");
      setUser(user);
      
      if (user) {
        try {
          // Fetch profile
          let profileData = await dbService.get('users', user.uid) as UserProfile;
          console.log("AuthProvider: Perfil carregado:", profileData ? "Sucesso" : "Não encontrado");
          
          if (!profileData) {
            console.log("AuthProvider: Criando novo perfil para o utilizador no Firestore...");
            
            // Verificar se é o primeiro utilizador do sistema
            const allUsers = await dbService.list('users');
            const isFirstUser = allUsers.length === 0;
            
            // Se for o primeiro, é ADMIN, senão é OPERATOR
            const role = isFirstUser ? UserRole.ADMIN : UserRole.OPERATOR;
            
            const newProfile = {
              uid: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'Utilizador',
              email: user.email || '',
              role: role,
              createdAt: new Date(),
              lastLogin: new Date(),
            };
            
            await dbService.set('users', user.uid, newProfile);
            profileData = { id: user.uid, ...newProfile } as UserProfile;
            console.log(`AuthProvider: Perfil criado como ${role}`);
          } else {
            // Update last login
            await dbService.update('users', user.uid, { lastLogin: new Date() });
          }

          // Register entry (session log)
          await dbService.add('user_sessions', {
            userId: user.uid,
            email: user.email,
            timestamp: new Date(),
            type: 'LOGIN'
          });

          setProfile(profileData);
        } catch (error) {
          console.error("AuthProvider Error (Fetch/Create Profile):", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === UserRole.ADMIN
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
