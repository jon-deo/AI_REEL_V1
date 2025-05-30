import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function ApiDocsPage() {
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
          <h1 className="text-3xl font-bold">API Documentation</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Reels API</h2>

          <div className="mb-8">
            <h3 className="text-xl font-medium mb-3">List All Reels</h3>
            <div className="bg-gray-100 p-4 rounded-md mb-3">
              <p className="font-mono">GET /api/reels</p>
            </div>
            <p>Fetches all available reels.</p>
            <h4 className="text-lg font-medium mt-4 mb-2">Response</h4>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
{`[
  {
    "id": 1,
    "celebrity_id": 1,
    "celebrity_name": "Michael Jordan",
    "sport": "Basketball",
    "title": "The Air Jordan Legacy",
    "description": "A brief history of Michael Jordan's career",
    "video_url": "https://example.com/videos/michael-jordan.mp4",
    "thumbnail_url": "https://example.com/thumbnails/michael-jordan.jpg",
    "status": "completed",
    "created_at": "2023-06-01T12:00:00.000Z"
  },
  ...
]`}
            </pre>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-medium mb-3">Get Single Reel</h3>
            <div className="bg-gray-100 p-4 rounded-md mb-3">
              <p className="font-mono">GET /api/reels/{'{id}'}</p>
            </div>
            <p>Fetches a specific reel by its ID.</p>
            <h4 className="text-lg font-medium mt-4 mb-2">Response</h4>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
{`{
  "id": 1,
  "celebrity_id": 1,
  "celebrity_name": "Michael Jordan",
  "sport": "Basketball",
  "title": "The Air Jordan Legacy",
  "description": "A brief history of Michael Jordan's career",
  "video_url": "https://example.com/videos/michael-jordan.mp4",
  "thumbnail_url": "https://example.com/thumbnails/michael-jordan.jpg",
  "status": "completed",
  "created_at": "2023-06-01T12:00:00.000Z"
}`}
            </pre>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-medium mb-3">Create New Reel</h3>
            <div className="bg-gray-100 p-4 rounded-md mb-3">
              <p className="font-mono">POST /api/reels</p>
            </div>
            <p>Creates a new sports celebrity reel.</p>
            <h4 className="text-lg font-medium mt-4 mb-2">Request Body</h4>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
{`{
  "name": "Lionel Messi",
  "sport": "Soccer",
  "description": "Optional additional details"
}`}
            </pre>
            <h4 className="text-lg font-medium mt-4 mb-2">Response</h4>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
{`{
  "title": "Messi: The GOAT of Soccer",
  "script": "Lionel Messi, widely regarded as one of the greatest...",
  "audioUrl": "https://example.com/audio/lionel-messi.mp3",
  "videoUrl": "https://example.com/videos/lionel-messi.mp4",
  "thumbnailUrl": "https://example.com/thumbnails/lionel-messi.jpg",
  "celebrity": {
    "id": 2,
    "name": "Lionel Messi",
    "sport": "Soccer"
  }
}`}
            </pre>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-medium mb-3">Setup Database</h3>
            <div className="bg-gray-100 p-4 rounded-md mb-3">
              <p className="font-mono">GET /api/setup</p>
            </div>
            <p>Creates the necessary database tables.</p>
            <h4 className="text-lg font-medium mt-4 mb-2">Response</h4>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
{`{
  "message": "Database tables created successfully"
}`}
            </pre>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-medium mb-3">Get All Celebrities</h3>
            <div className="bg-gray-100 p-4 rounded-md mb-3">
              <p className="font-mono">GET /api/celebrities</p>
            </div>
            <p>Fetches all celebrities from the database.</p>
            <h4 className="text-lg font-medium mt-4 mb-2">Response</h4>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
{`[
  {
    "id": 1,
    "name": "Cristiano Ronaldo",
    "sport": "Soccer",
    "description": "Portuguese professional footballer",
    "created_at": "2023-06-01T12:00:00.000Z"
  },
  ...
]`}
            </pre>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-medium mb-3">Add Celebrity</h3>
            <div className="bg-gray-100 p-4 rounded-md mb-3">
              <p className="font-mono">POST /api/celebrities</p>
            </div>
            <p>Adds a new celebrity to the database.</p>
            <h4 className="text-lg font-medium mt-4 mb-2">Request Body</h4>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
{`{
  "name": "Roger Federer",
  "sport": "Tennis",
  "description": "Swiss professional tennis player"
}`}
            </pre>
            <h4 className="text-lg font-medium mt-4 mb-2">Response</h4>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
{`{
  "id": 3,
  "name": "Roger Federer",
  "sport": "Tennis",
  "description": "Swiss professional tennis player",
  "created_at": "2023-06-01T12:00:00.000Z"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 