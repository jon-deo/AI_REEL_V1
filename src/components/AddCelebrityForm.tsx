'use client';

import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';

interface FormState {
  name: string;
  sport: string;
  description: string;
}

interface AddCelebrityFormProps {
  onSuccess?: () => void;
}

const AddCelebrityForm = ({ onSuccess }: AddCelebrityFormProps) => {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    sport: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/celebrities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add celebrity');
      }

      const result = await response.json();
      setSuccess(`Successfully added ${result.name} to the database!`);
      setFormData({
        name: '',
        sport: '',
        description: '',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error adding celebrity:', err);
      setError(err instanceof Error ? err.message : 'Failed to add celebrity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonSports = [
    'Basketball',
    'Football',
    'Soccer',
    'Tennis',
    'Golf',
    'Baseball',
    'Cricket',
    'Boxing',
    'MMA',
    'Swimming',
    'Athletics',
    'Hockey',
    'Volleyball',
    'Gymnastics',
    'Rugby',
    'Wrestling',
    'Skiing',
    'Snowboarding',
    'Skateboarding',
    'Surfing',
    'Motorsports'
  ];

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Add New Celebrity</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-gray-700 font-medium mb-2"
          >
            Celebrity Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            placeholder="e.g. Cristiano Ronaldo"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="sport"
            className="block text-gray-700 font-medium mb-2"
          >
            Sport*
          </label>
          <select
            id="sport"
            name="sport"
            value={formData.sport}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          >
            <option value="">Select a sport</option>
            {commonSports.map((sport) => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-gray-700 font-medium mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            placeholder="Enter a description of the celebrity..."
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-purple-300 transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <FaSpinner className="animate-spin mr-2" />
              Adding...
            </span>
          ) : (
            'Add Celebrity'
          )}
        </button>
      </form>
    </div>
  );
};

export default AddCelebrityForm; 