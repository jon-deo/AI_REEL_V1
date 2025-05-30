import Link from 'next/link';
import ReelViewer from '@/components/ReelViewer';
import { FaPlus, FaCode, FaDatabase, FaUserPlus, FaTools } from 'react-icons/fa';

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
        
        {/* API documentation button */}
        <Link
          href="/api-docs"
          className="bg-gray-700 hover:bg-gray-800 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-105"
          aria-label="API Documentation"
        >
          <FaCode size={24} />
        </Link>
        
        {/* Initialize database button */}
        <Link
          href="/api/setup"
          className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-105"
          aria-label="Initialize Database"
        >
          <FaDatabase size={24} />
        </Link>

        {/* Debug database button */}
        <Link
          href="/debug-database"
          className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-105"
          aria-label="Debug Database"
        >
          <FaTools size={24} />
        </Link>
      </div>
    </div>
  );
}
