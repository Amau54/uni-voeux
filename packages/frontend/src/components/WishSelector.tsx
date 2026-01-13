// Fichier : packages/frontend/src/components/WishSelector.tsx
'use client'; // Important pour Next.js App Router

import React, { useState, useMemo, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useAuth } from '../lib/AuthContext';
// CORRECTION ICI : Le chemin vers lib est maintenant "../lib/firebase"
import { db } from '../lib/firebase';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';

const WishSelector = () => {
  const { currentUser } = useAuth();
  const [wishes, setWishes] = useState<any[]>([]); // Ajout de typage basique pour éviter erreurs TS
  const [selectedWishes, setSelectedWishes] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState('capacity');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishes = async () => {
      setIsLoading(true);
      try {
        const wishesSnapshot = await getDocs(collection(db, 'wishes'));
        const wishesList = wishesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWishes(wishesList);
      } catch (error) {
        console.error("Erreur lecture vœux:", error);
      }
      setIsLoading(false);
    };

    fetchWishes();
  }, []);

  const sortedWishes = useMemo(() => {
    // @ts-ignore
    const availableWishes = wishes.filter(w => !selectedWishes.find(sw => sw.id === w.id));
    
    if (sortOrder === 'alpha') {
      // @ts-ignore
      return [...availableWishes].sort((a, b) => a.title.localeCompare(b.title));
    }
    // @ts-ignore
    return [...availableWishes].sort((a, b) => (b.maxCapacity - b.currentCapacity) - (a.maxCapacity - a.currentCapacity));
  }, [wishes, selectedWishes, sortOrder]);

  const handleSelectWish = (wish: any) => {
    if (selectedWishes.length < 9) {
      setSelectedWishes([...selectedWishes, wish]);
    }
  };

  const handleRemoveWish = (wishToRemove: any) => {
    setSelectedWishes(selectedWishes.filter(wish => wish.id !== wishToRemove.id));
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const items = Array.from(selectedWishes);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    setSelectedWishes(items);
  };
  
  const handleValidate = async () => {
    if (!currentUser) {
      alert("Veuillez vous connecter pour valider vos vœux.");
      return;
    }

    if (selectedWishes.length === 0) {
      alert("Veuillez sélectionner au moins un vœu.");
      return;
    }

    try {
      const batch = writeBatch(db);
      const userSelectionsRef = collection(db, 'users', currentUser.uid, 'selections');

      // Ajouter chaque sélection au batch
      selectedWishes.forEach((wish, index) => {
        const selectionDocRef = doc(userSelectionsRef, wish.id);
        batch.set(selectionDocRef, {
          wishId: wish.id,
          priority: index + 1,
        });
      });
      
      // Mettre à jour le statut de l'utilisateur
      const userRef = doc(db, 'users', currentUser.uid);
      batch.update(userRef, { status: 'Validé' });

      await batch.commit();
      alert(`Vous avez validé ${selectedWishes.length} vœux. Votre profil est maintenant verrouillé.`);
    } catch (error) {
      console.error("Erreur lors de la validation des vœux:", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  if (isLoading) {
    return <div>Chargement des vœux...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Sélectionnez vos Vœux</h1>
      
      <div className="flex justify-end mb-4">
        <button 
            onClick={() => setSortOrder('capacity')}
            className={`mr-2 p-2 rounded ${sortOrder === 'capacity' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
            Trier par Capacité
        </button>
        <button 
            onClick={() => setSortOrder('alpha')}
            className={`p-2 rounded ${sortOrder === 'alpha' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
            Trier par Ordre Alphabétique
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Colonne des vœux disponibles */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Vœux Disponibles</h2>
          <div className="border p-2 rounded-lg h-96 overflow-y-auto">
            {sortedWishes.map(wish => (
              <div key={wish.id} className="p-2 border-b flex justify-between items-center">
                <div>
                  <p className="font-bold">{wish.title}</p>
                  <p className="text-sm text-gray-600">
                    Places restantes: {wish.maxCapacity - wish.currentCapacity}
                  </p>
                </div>
                <button onClick={() => handleSelectWish(wish)} className="bg-green-500 text-white p-1 rounded">+</button>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne du panier de sélection */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Votre Sélection (1 à 9 vœux)</h2>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="wishes">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="border p-2 rounded-lg h-96 overflow-y-auto">
                  {selectedWishes.length === 0 ? (
                      <p className="text-gray-500 text-center mt-4">Glissez vos vœux ici</p>
                  ) : (
                      selectedWishes.map((wish, index) => (
                        <Draggable key={wish.id} draggableId={wish.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-2 border-b flex justify-between items-center"
                            >
                              <div>
                                <p><span className="font-bold">{index + 1}.</span> {wish.title}</p>
                              </div>
                              <button onClick={() => handleRemoveWish(wish)} className="bg-red-500 text-white p-1 rounded">-</button>
                            </div>
                          )}
                        </Draggable>
                      ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      <div className="text-center mt-6">
        <button 
            onClick={handleValidate}
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400"
            disabled={selectedWishes.length === 0}
        >
            Valider ma sélection
        </button>
      </div>
    </div>
  );
};

export default WishSelector;