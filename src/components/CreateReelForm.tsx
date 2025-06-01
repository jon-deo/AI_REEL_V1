'use client';

import { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import Link from 'next/link';

interface Celebrity {
  id: number;
  name: string;
  sport: string;
  description?: string;
}

interface FormState {
  name: string;
  sport: string;
  description: string;
  celebrity_id?: number;
}

interface CreateReelFormProps {
  onSuccess?: () => void;
}

const CreateReelForm = ({ onSuccess }: CreateReelFormProps) => {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    sport: '',
    description: '',
  });
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [isLoadingCelebrities, setIsLoadingCelebrities] = useState(true);
  const [selectedCelebrity, setSelectedCelebrity] = useState<Celebrity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [progressMessage, setProgressMessage] = useState('');

  // Fetch celebrities when the component mounts
  useEffect(() => {
    const fetchCelebrities = async () => {
      try {
        setIsLoadingCelebrities(true);
        const response = await fetch('/api/celebrities');
        
        if (!response.ok) {
          throw new Error('Failed to fetch celebrities');
        }
        
        const data = await response.json();
        setCelebrities(data);
      } catch (err) {
        console.error('Error fetching celebrities:', err);
      } finally {
        setIsLoadingCelebrities(false);
      }
    };

    fetchCelebrities();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'celebrity_id' && value) {
      const celebId = parseInt(value);
      const selected = celebrities.find(c => c.id === celebId) || null;
      
      if (selected) {
        setSelectedCelebrity(selected);
        setFormData({
          name: selected.name,
          sport: selected.sport,
          description: selected.description || '',
          celebrity_id: selected.id
        });
      } else {
        setSelectedCelebrity(null);
        setFormData({
          name: '',
          sport: '',
          description: '',
        });
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    setProgressMessage('Processing your request in real-time...');

    try {
      const response = await fetch('/api/reels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create reel');
      }

      // Get response but no need to use it directly
      await response.json();
      
      setSuccess('Reel created successfully! It will appear in the reel feed now.');
      setProgressMessage('');
      setFormData({
        name: '',
        sport: '',
        description: '',
      });
      setSelectedCelebrity(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error creating reel:', err);
      setError(err instanceof Error ? err.message : 'Failed to create reel');
      setProgressMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Create New Sports Reel</h2>

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

      {isSubmitting && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-md">
          <div className="flex items-center mb-2">
            <FaSpinner className="animate-spin mr-2" />
            <p className="font-semibold">Creating your reel</p>
          </div>
          <p className="text-sm">This may take several minutes as we generate a custom reel.</p>
          {progressMessage && <p className="mt-2 text-sm font-medium">{progressMessage}</p>}
          <div className="mt-3 h-2 bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse rounded-full"></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {isLoadingCelebrities ? (
          <div className="flex items-center justify-center py-6">
            <FaSpinner className="animate-spin text-blue-500 mr-2" />
            <span>Loading celebrities...</span>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label
                htmlFor="celebrity_id"
                className="block text-gray-700 font-medium mb-2"
              >
                Select Celebrity
              </label>
              {celebrities.length > 0 ? (
                <select
                  id="celebrity_id"
                  name="celebrity_id"
                  value={selectedCelebrity?.id || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                >
                  <option value="">-- Select a celebrity --</option>
                  {celebrities.map((celebrity) => (
                    <option key={celebrity.id} value={celebrity.id}>
                      {celebrity.name} ({celebrity.sport})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-4 border border-dashed border-gray-300 rounded-md text-center">
                  <p className="text-gray-600 mb-2">No celebrities found</p>
                  <Link 
                    href="/celebrities/add" 
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Add celebrities first
                  </Link>
                </div>
              )}
            </div>

            {!selectedCelebrity && (
              <>
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
                    placeholder="e.g. Michael Jordan"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="sport"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Sport*
                  </label>
                  <input
                    type="text"
                    id="sport"
                    name="sport"
                    value={formData.sport}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                    placeholder="e.g. Basketball"
                  />
                </div>
              </>
            )}

            <div className="mb-6">
              <label
                htmlFor="description"
                className="block text-gray-700 font-medium mb-2"
              >
                Additional Information (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                placeholder="Add any specific details about the celebrity..."
              ></textarea>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isSubmitting || isLoadingCelebrities || (celebrities.length === 0 && !formData.name)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 transition-colors"
        >
          {isSubmitting ? 'Processing...' : 'Create Reel'}
        </button>
      </form>
    </div>
  );
};

export default CreateReelForm; 