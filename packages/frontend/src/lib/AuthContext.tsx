// Fichier: packages/frontend/src/lib/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase'; // Assurez-vous que ce chemin est correct

// Définir l'interface pour la valeur du contexte
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
}

// Créer le contexte avec une valeur par défaut
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
});

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  return useContext(AuthContext);
};

// Fournisseur de contexte
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Écouter les changements d'état d'authentification de Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Nettoyer l'écouteur lors du démontage du composant
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
  };

  // Ne pas rendre les enfants tant que le statut d'authentification n'est pas déterminé
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
