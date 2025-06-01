import Link from 'next/link';
import ReelViewer from '@/components/ReelViewer';
import { FaPlus, FaUserPlus } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="relative">
      <ReelViewer />
      
      {/* Floating action buttons */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col space-y-4">
        {/* Create new reel button */}
        <Link
          href="/create"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-105"
          aria-label="Create new reel"
        >
          <FaPlus size={24} />
        </Link>
        
        {/* Add new celebrity button */}
        <Link
          href="/celebrities/add"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-105"
          aria-label="Add new celebrity"
        >
          <FaUserPlus size={24} />
        </Link>
      </div>
    </div>
  );
}
