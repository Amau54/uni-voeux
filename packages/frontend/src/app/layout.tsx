import React from 'react';
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
        <header className="bg-white shadow-md">
          <nav className="container mx-auto px-6 py-4">
            <h1 className="text-xl font-bold text-gray-800">Uni-Voeux</h1>
          </nav>
        </header>
        <main className="container mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}