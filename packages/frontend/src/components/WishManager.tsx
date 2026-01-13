// Fichier: packages/frontend/src/components/WishManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const WishManager = () => {
  const [wishes, setWishes] = useState<any[]>([]);
  const [newWishTitle, setNewWishTitle] = useState('');
  const [newWishCapacity, setNewWishCapacity] = useState(1);
  const [editingWish, setEditingWish] = useState<any | null>(null);

  useEffect(() => {
    fetchWishes();
  }, []);

  const fetchWishes = async () => {
    const wishesSnapshot = await getDocs(collection(db, 'wishes'));
    setWishes(wishesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleAddWish = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'wishes'), {
      title: newWishTitle,
      maxCapacity: newWishCapacity,
      currentCapacity: 0,
    });
    setNewWishTitle('');
    setNewWishCapacity(1);
    fetchWishes();
  };

  const handleUpdateWish = async (id: string) => {
    const wishRef = doc(db, 'wishes', id);
    await updateDoc(wishRef, {
      title: editingWish.title,
      maxCapacity: editingWish.maxCapacity,
    });
    setEditingWish(null);
    fetchWishes();
  };

  const handleDeleteWish = async (id: string) => {
    await deleteDoc(doc(db, 'wishes', id));
    fetchWishes();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Gérer les Vœux</h2>
      <form onSubmit={handleAddWish} className="mb-4">
        <input
          type="text"
          value={newWishTitle}
          onChange={(e) => setNewWishTitle(e.target.value)}
          placeholder="Titre du vœu"
          className="border p-2 rounded mr-2"
        />
        <input
          type="number"
          value={newWishCapacity}
          onChange={(e) => setNewWishCapacity(parseInt(e.target.value))}
          min="1"
          className="border p-2 rounded mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Ajouter
        </button>
      </form>
      <div>
        {wishes.map(wish => (
          <div key={wish.id} className="p-2 border-b">
            {editingWish?.id === wish.id ? (
              <>
                <input
                  type="text"
                  value={editingWish.title}
                  onChange={(e) => setEditingWish({ ...editingWish, title: e.target.value })}
                />
                <input
                  type="number"
                  value={editingWish.maxCapacity}
                  onChange={(e) => setEditingWish({ ...editingWish, maxCapacity: parseInt(e.target.value) })}
                />
                <button onClick={() => handleUpdateWish(wish.id)}>Sauvegarder</button>
                <button onClick={() => setEditingWish(null)}>Annuler</button>
              </>
            ) : (
              <>
                <p>{wish.title} (Capacité: {wish.maxCapacity})</p>
                <button onClick={() => setEditingWish(wish)}>Modifier</button>
                <button onClick={() => handleDeleteWish(wish.id)}>Supprimer</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishManager;
