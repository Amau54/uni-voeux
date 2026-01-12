// packages/frontend/src/components/WishSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { getWishes, saveStudentWishes, getStudentWishes, Wish } from '../lib/firestore';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useAuth } from '../contexts/AuthContext';

const WishSelector = () => {
  const { user, loading: authLoading } = useAuth();
  const [availableWishes, setAvailableWishes] = useState<Wish[]>([]);
  const [selectedWishes, setSelectedWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        setLoading(false);
        setError("Please log in to select your wishes.");
        return;
    }

    const fetchData = async () => {
      try {
        const allWishes = await getWishes();
        const savedWishIds = await getStudentWishes(user.uid);

        if (savedWishIds) {
          const savedWishes = savedWishIds.map(id => allWishes.find(w => w.id === id)).filter(Boolean) as Wish[];
          setSelectedWishes(savedWishes);
          setIsLocked(true);
        }

        setAvailableWishes(allWishes);
      } catch (err) {
        setError('Failed to load wish data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, authLoading]);

  const handleSelectWish = (wish: Wish) => {
    if (selectedWishes.length < 9 && !selectedWishes.some(w => w.id === wish.id)) {
      setSelectedWishes([...selectedWishes, wish]);
    }
  };

  const handleRemoveWish = (wishId: string) => {
    setSelectedWishes(selectedWishes.filter(w => w.id !== wishId));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(selectedWishes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSelectedWishes(items);
  };
  
  const handleSubmit = async () => {
    if (!user) {
        setError("You must be logged in to submit.");
        return;
    }
    if (selectedWishes.length !== 9) {
      setError('You must select exactly 9 wishes.');
      return;
    }
    try {
      const wishIds = selectedWishes.map(w => w.id);
      await saveStudentWishes(user.uid, wishIds);
      setIsLocked(true);
      setError(null);
    } catch (err) {
      setError('Failed to save your wishes. Please try again.');
      console.error(err);
    }
  };

  if (loading || authLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (isLocked) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Submitted Wishes</h2>
        <p className="mb-4 text-green-600">Your choices have been locked and submitted successfully.</p>
        <ol className="list-decimal list-inside space-y-2">
          {selectedWishes.map(wish => (
            <li key={wish.id} className="p-2 border rounded">{wish.name}</li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Wishes</h2>
        <div className="space-y-2">
          {availableWishes.map(wish => (
            <div key={wish.id} className="p-4 border rounded-md flex justify-between items-center">
              <span>{wish.name}</span>
              <button
                onClick={() => handleSelectWish(wish)}
                disabled={selectedWishes.length >= 9 || selectedWishes.some(w => w.id === wish.id)}
                className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-400"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Your 9 Choices (drag to reorder)</h2>
        <p className="mb-2">Priority 1 (highest) to 9 (lowest)</p>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="selectedWishes">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="p-4 bg-gray-100 rounded-md min-h-[200px]">
                {selectedWishes.map((wish, index) => (
                  <Draggable key={wish.id} draggableId={wish.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="p-2 mb-2 bg-white rounded shadow-sm flex justify-between items-center"
                      >
                        <span>{index + 1}. {wish.name}</span>
                        <button onClick={() => handleRemoveWish(wish.id)} className="text-red-500 hover:text-red-700">
                          Remove
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={selectedWishes.length !== 9}
            className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            Validate My 9 Choices
          </button>
          {selectedWishes.length !== 9 && (
            <p className="text-sm text-red-500 mt-2">
              You must have exactly 9 wishes selected to submit. You currently have {selectedWishes.length}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishSelector;
