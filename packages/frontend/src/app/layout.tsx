import React from 'react';
import { AuthProvider } from '../lib/auth';
import { Toaster } from 'react-hot-toast';
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
          <Toaster position="bottom-center" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}