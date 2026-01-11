import React from 'react';
import './globals.css'; // On créera ce fichier juste après ou on le commente pour l'instant

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
      <body>{children}</body>
    </html>
  );
}