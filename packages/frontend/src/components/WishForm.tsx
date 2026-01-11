// packages/frontend/src/components/WishForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Wish } from '../lib/firestore';

interface WishFormProps {
  wish?: Wish | null;
  onSubmit: (formData: Omit<Wish, 'id'>) => void;
  onCancel?: () => void;
  submitButtonText?: string;
}

const WishForm: React.FC<WishFormProps> = ({ wish, onSubmit, onCancel, submitButtonText = 'Submit' }) => {
  const [name, setName] = useState('');
  const [places, setPlaces] = useState(10);
  const [customLabels, setCustomLabels] = useState<{ key: string; value: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wish) {
      setName(wish.name);
      setPlaces(wish.places);
      // Extract custom labels from the wish object, excluding reserved fields
      const reservedKeys = ['id', 'name', 'places'];
      const loadedLabels = Object.entries(wish)
        .filter(([key]) => !reservedKeys.includes(key))
        .map(([key, value]) => ({ key, value: String(value) }));
      setCustomLabels(loadedLabels);
    }
  }, [wish]);

  const handleLabelChange = (index: number, field: 'key' | 'value', value: string) => {
    const newLabels = [...customLabels];
    newLabels[index][field] = value;
    setCustomLabels(newLabels);
  };

  const handleAddLabel = () => {
    setCustomLabels([...customLabels, { key: '', value: '' }]);
  };

  const handleRemoveLabel = (index: number) => {
    const newLabels = customLabels.filter((_, i) => i !== index);
    setCustomLabels(newLabels);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!name.trim()) {
      setError('Wish name is required.');
      return;
    }
    if (places <= 0) {
      setError('Places must be a positive number.');
      return;
    }
    // Validate custom labels: ensure no empty keys and all keys are unique
    const keys = new Set<string>();
    for (const label of customLabels) {
      if (!label.key.trim()) {
        setError('Custom label keys cannot be empty.');
        return;
      }
      if (keys.has(label.key.trim())) {
        setError(`Duplicate custom label key found: "${label.key}"`);
        return;
      }
      keys.add(label.key.trim());
    }

    // Construct the form data object
    const formData: Omit<Wish, 'id'> = {
      name,
      places,
    };
    customLabels.forEach(label => {
      formData[label.key.trim()] = label.value;
    });

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border border-gray-200 rounded-lg space-y-4">
      <div>
        <label htmlFor="wish-name" className="block text-sm font-medium text-gray-700">Wish Name</label>
        <input
          id="wish-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="wish-places" className="block text-sm font-medium text-gray-700">Available Places</label>
        <input
          id="wish-places"
          type="number"
          value={places}
          onChange={(e) => setPlaces(Number(e.target.value))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          min="1"
          required
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-md font-semibold">Custom Labels</h3>
        {customLabels.map((label, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Label Key (e.g., Address)"
              value={label.key}
              onChange={(e) => handleLabelChange(index, 'key', e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="Label Value"
              value={label.value}
              onChange={(e) => handleLabelChange(index, 'value', e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={() => handleRemoveLabel(index)}
              className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddLabel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          + Add Label
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
        >
          {submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default WishForm;
