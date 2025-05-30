'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaSync, FaDatabase, FaTable } from 'react-icons/fa';

export default function DebugDatabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<{
    status: 'loading' | 'success' | 'error';
    message: string;
    details?: Record<string, unknown>;
  }>({
    status: 'loading',
    message: 'Testing database connection...',
  });

  const [setupStatus, setSetupStatus] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    details?: Record<string, unknown>;
  }>({
    status: 'idle',
    message: 'Click to create database tables',
  });

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setConnectionStatus({
      status: 'loading',
      message: 'Testing database connection...',
    });

    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();

      if (response.ok) {
        setConnectionStatus({
          status: 'success',
          message: 'Database connection successful!',
          details: data,
        });
      } else {
        setConnectionStatus({
          status: 'error',
          message: 'Database connection failed',
          details: data,
        });
      }
    } catch (error) {
      setConnectionStatus({
        status: 'error',
        message: 'Error testing database connection',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  };

  const setupDatabase = async () => {
    setSetupStatus({
      status: 'loading',
      message: 'Setting up database tables...',
    });

    try {
      const response = await fetch('/api/setup');
      const data = await response.json();

      if (response.ok) {
        setSetupStatus({
          status: 'success',
          message: 'Database tables created successfully!',
          details: data,
        });
      } else {
        setSetupStatus({
          status: 'error',
          message: 'Failed to create database tables',
          details: data,
        });
      }
    } catch (error) {
      setSetupStatus({
        status: 'error',
        message: 'Error setting up database',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  };

  const getStatusColor = (status: 'loading' | 'success' | 'error' | 'idle') => {
    switch (status) {
      case 'success':
        return 'bg-green-100 border-green-400 text-green-700';
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700';
      case 'loading':
        return 'bg-blue-100 border-blue-400 text-blue-700';
      case 'idle':
        return 'bg-gray-100 border-gray-400 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800">
            <FaArrowLeft className="mr-2" />
            Back to Reels
          </Link>
          <h1 className="text-3xl font-bold">Database Troubleshooting</h1>
        </div>

        <div className="mb-8">
          <p className="text-gray-600 max-w-2xl mb-6">
            Use this page to check the database connection status and setup the database tables.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Connection Status */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <FaDatabase className="mr-2" /> Database Connection
                </h2>
                <button
                  onClick={testConnection}
                  className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                >
                  <FaSync className="mr-1" /> Test
                </button>
              </div>

              <div
                className={`border px-4 py-3 rounded mb-4 ${getStatusColor(
                  connectionStatus.status
                )}`}
              >
                <p className="font-medium">{connectionStatus.message}</p>
                {connectionStatus.status === 'loading' && (
                  <div className="mt-2 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-700 mr-2"></div>
                    <span>Testing connection...</span>
                  </div>
                )}
              </div>

              {connectionStatus.details && (
                <div className="bg-gray-50 p-3 rounded overflow-auto max-h-40">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(connectionStatus.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Setup Tables */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <FaTable className="mr-2" /> Database Tables
                </h2>
                <button
                  onClick={setupDatabase}
                  disabled={connectionStatus.status !== 'success'}
                  className={`flex items-center px-3 py-1 rounded ${
                    connectionStatus.status === 'success'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaTable className="mr-1" /> Setup Tables
                </button>
              </div>

              <div
                className={`border px-4 py-3 rounded mb-4 ${getStatusColor(setupStatus.status)}`}
              >
                <p className="font-medium">{setupStatus.message}</p>
                {setupStatus.status === 'loading' && (
                  <div className="mt-2 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-700 mr-2"></div>
                    <span>Setting up tables...</span>
                  </div>
                )}
              </div>

              {setupStatus.details && (
                <div className="bg-gray-50 p-3 rounded overflow-auto max-h-40">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(setupStatus.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Tips</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>
              <strong>Connection issues:</strong> Verify that your DATABASE_URL and POSTGRES_URL in
              the .env.local file are correct.
            </li>
            <li>
              <strong>Authentication errors:</strong> Check that your database credentials are valid.
            </li>
            <li>
              <strong>SSL errors:</strong> Neon PostgreSQL requires SSL connections. The sslmode=require parameter should be included in your connection string.
            </li>
            <li>
              <strong>Missing tables:</strong> Make sure to run the setup tables function before
              attempting to create celebrities or reels.
            </li>
            <li>
              <strong>Error 28P01:</strong> Invalid password for the database user.
            </li>
            <li>
              <strong>Error 3D000:</strong> The database specified in the connection string doesn&apos;t exist.
            </li>
          </ul>
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 