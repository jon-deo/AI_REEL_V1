'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CreateReelForm from '@/components/CreateReelForm';
import { FaArrowLeft } from 'react-icons/fa';

export default function CreateReelPage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSuccess = () => {
    setIsRedirecting(true);
    // Redirect immediately without delay
    router.push('/');
  };

  return (
    <div className="h-full bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link 
            href="/" 
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-2" />
            Back to Reels
          </Link>
          <h1 className="text-3xl font-bold">Create New Reel</h1>
        </div>

        <div className="mb-8">
          <p className="text-gray-600 max-w-2xl">
            Create a new sports celebrity reel by entering the athlete&apos;s name and sport. 
            Our AI will instantly generate a video showcasing their career highlights 
            and achievements.
          </p>
        </div>

        <CreateReelForm onSuccess={handleSuccess} />

        {isRedirecting && (
          <div className="mt-6 text-center text-green-600">
            <p>Redirecting to reels page...</p>
          </div>
        )}
      </div>
    </div>
  );
} 