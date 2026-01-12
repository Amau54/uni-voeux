// packages/frontend/src/components/wishes-list.tsx
'use client';

import { useState, useEffect } from 'react';
import { getWishes, deleteWish, updateWish, addWish, Wish } from '../lib/firestore';
import WishForm from './WishForm';

const WishesList = () => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingWishId, setEditingWishId] = useState<string | null>(null);
  const [expandedWishId, setExpandedWishId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishes = async () => {
      try {
        const wishesData = await getWishes();
        setWishes(wishesData);
      } catch (err) {
        setError('Failed to fetch wishes. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishes();
  }, []);

  const handleAddWish = async (formData: Omit<Wish, 'id'>) => {
    try {
        const newWish = await addWish(formData);
        setWishes((prevWishes) => [...prevWishes, newWish]);
    } catch (err) {
        setError('Failed to add wish. Please try again.');
        console.error(err);
    }
  };

  const handleDeleteWish = async (wishId: string) => {
    try {
        await deleteWish(wishId);
        setWishes((prevWishes) => prevWishes.filter((wish) => wish.id !== wishId));
    } catch (err) {
        setError('Failed to delete wish. Please try again.');
        console.error(err);
    }
  };

  const handleEditWish = (wish: Wish) => {
    setEditingWishId(wish.id);
  };

  const handleUpdateWish = async (wishId: string, formData: Omit<Wish, 'id'>) => {
    try {
        await updateWish(wishId, formData);
        setWishes((prevWishes) =>
            prevWishes.map((wish) =>
                wish.id === wishId ? { id: wishId, ...formData } : wish
            )
        );
        setEditingWishId(null);
    } catch (err) {
        setError('Failed to update wish. Please try again.');
        console.error(err);
    }
  };

  if (loading) {
    return <p>Loading wishes...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className="space-y-8">
        <div>
            <h2 className="text-xl font-semibold mb-4">Add New Wish</h2>
            <WishForm
                onSubmit={handleAddWish}
                submitButtonText="Add Wish"
            />
        </div>
        <div className="overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Current Wishes</h2>
        <table className="min-w-full bg-white border border-gray-200">
            <thead>
            <tr>
                <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Wish Name
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Available Places
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
                </th>
            </tr>
            </thead>
            <tbody>
            {wishes.length > 0 ? (
                wishes.map((wish) => (
                    <React.Fragment key={wish.id}>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                {wish.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                {wish.places}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                                <button
                                    onClick={() => setExpandedWishId(expandedWishId === wish.id ? null : wish.id)}
                                    className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700"
                                >
                                    {expandedWishId === wish.id ? 'Hide' : 'Details'}
                                </button>
                                <button
                                    onClick={() => handleEditWish(wish)}
                                    className="ml-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteWish(wish.id)}
                                    className="ml-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                        {expandedWishId === wish.id && (
                            <tr>
                                <td colSpan={3} className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <h4 className="font-semibold">Custom Details:</h4>
                                    <ul className="list-disc list-inside mt-2">
                                        {Object.entries(wish)
                                            .filter(([key]) => !['id', 'name', 'places'].includes(key))
                                            .map(([key, value]) => (
                                                <li key={key}>
                                                    <strong>{key}:</strong> {String(value)}
                                                </li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))
            ) : (
                <tr>
                <td colSpan={3} className="px-6 py-4 text-center border-b border-gray-200">
                    No wishes found.
                </td>
                </tr>
            )}
            </tbody>
        </table>
        </div>
        {editingWishId && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                <div className="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Edit Wish</h3>
                    <WishForm
                        wish={wishes.find(w => w.id === editingWishId)}
                        onSubmit={(formData) => handleUpdateWish(editingWishId, formData)}
                        onCancel={() => setEditingWishId(null)}
                        submitButtonText="Update Wish"
                    />
                </div>
            </div>
        )}
    </div>
  );
};

export default WishesList;
