// packages/frontend/src/components/EditStudentWishesModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { getWishes, getStudentWishes, saveStudentWishes, Wish, Student } from '../lib/firestore';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface EditStudentWishesModalProps {
  student: Student;
  onClose: () => void;
}

const EditStudentWishesModal: React.FC<EditStudentWishesModalProps> = ({ student, onClose }) => {
  const [allWishes, setAllWishes] = useState<Wish[]>([]);
  const [selectedWishes, setSelectedWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const wishesData = await getWishes();
        setAllWishes(wishesData);
        const studentWishIds = await getStudentWishes(student.id);
        if (studentWishIds) {
          const studentWishes = studentWishIds.map(id => wishesData.find(w => w.id === id)).filter(Boolean) as Wish[];
          setSelectedWishes(studentWishes);
        }
      } catch (err) {
        setError('Failed to load wish data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [student.id]);

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

  const handleSave = async () => {
    if (selectedWishes.length !== 9) {
      setError('A student must have exactly 9 wishes.');
      return;
    }
    try {
      const wishIds = selectedWishes.map(w => w.id);
      await saveStudentWishes(student.id, wishIds);
      onClose();
    } catch (err) {
      setError('Failed to save wishes.');
      console.error(err);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Edit Wishes for {student.name}</h3>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div>
                <h4 className="text-md font-semibold mb-2">Available Wishes</h4>
                <div className="space-y-2">
                {allWishes.map(wish => (
                    <div key={wish.id} className="p-2 border rounded-md flex justify-between items-center">
                    <span>{wish.name}</span>
                    <button
                        onClick={() => handleSelectWish(wish)}
                        disabled={selectedWishes.length >= 9 || selectedWishes.some(w => w.id === wish.id)}
                        className="px-2 py-1 text-sm bg-blue-500 text-white rounded disabled:bg-gray-400"
                    >
                        Add
                    </button>
                    </div>
                ))}
                </div>
            </div>
            <div>
                <h4 className="text-md font-semibold mb-2">Selected Wishes (drag to reorder)</h4>
                <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="selectedWishesModal">
                    {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="p-2 bg-gray-100 rounded-md min-h-[200px]">
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
                                <button onClick={() => handleRemoveWish(wish.id)} className="text-red-500 text-sm">
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
            </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
            <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};

export default EditStudentWishesModal;
