// Fichier : packages/frontend/src/app/page.tsx
import React from 'react';
// CORRECTION ICI : On s'assure que le chemin remonte d'un cran (..) vers components
import WishSelector from '../components/WishSelector';

export default function Home() {
  return (
    <main style={{ padding: '20px' }}>
      <h1 className="text-2xl font-bold mb-4">Bienvenue sur Uni-Voeux</h1>
      <WishSelector />
    </main>
  );
}