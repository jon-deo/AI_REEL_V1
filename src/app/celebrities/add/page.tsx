'use client';

import { useState } from 'react';
import Link from 'next/link';
import AddCelebrityForm from '@/components/AddCelebrityForm';
import { FaArrowLeft } from 'react-icons/fa';

export default function AddCelebrityPage() {
  const [successCount, setSuccessCount] = useState(0);

  const handleSuccess = () => {
    setSuccessCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link 
            href="/" 
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-2" />
            Back to Reels
          </Link>
          <h1 className="text-3xl font-bold">Add Sports Celebrities</h1>
        </div>

        <div className="mb-8">
          <p className="text-gray-600 max-w-2xl">
            Add your favorite sports celebrities to the database. Once added, you can create reels for them using the Create Reel option.
          </p>
          {successCount > 0 && (
            <div className="mt-4 bg-green-50 text-green-800 p-4 rounded-md">
              <p className="font-medium">Successfully added {successCount} {successCount === 1 ? 'celebrity' : 'celebrities'}!</p>
              <p className="text-sm mt-1">You can continue adding more celebrities or <Link href="/create" className="text-green-700 underline">create reels</Link> for them.</p>
            </div>
          )}
        </div>

        <AddCelebrityForm onSuccess={handleSuccess} />
        
        <div className="mt-8 flex justify-center">
          <Link 
            href="/create" 
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Reel
          </Link>
        </div>
      </div>
    </div>
  );
} 