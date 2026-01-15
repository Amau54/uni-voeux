import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'Uni-Voeux',
  description: 'Plateforme d\'affectation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}