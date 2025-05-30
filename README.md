# Sports Celebrity Reels Generator

An AI-powered application that generates video reels showcasing the history and achievements of sports celebrities.

## Features

- Generate AI scripts about sports celebrities using OpenAI
- Convert text to speech with Amazon Polly
- Create images using DALL-E
- Combine audio and images into engaging short video reels
- TikTok-style vertical scrolling interface for viewing reels
- Store videos in AWS S3 and serve via CloudFront
- PostgreSQL database for storing metadata

## Prerequisites

### FFmpeg Installation

This application requires FFmpeg to be installed on your system for video processing:

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
1. Download FFmpeg from [ffmpeg.org](https://ffmpeg.org/download.html)
2. Extract the files and add the bin folder to your system PATH

You can verify the installation by running:
```bash
ffmpeg -version
```

### AWS Configuration

You'll need:
- An AWS account with S3 and CloudFront setup
- Amazon Polly access
- Proper IAM credentials

### Database Configuration

The application uses Neon PostgreSQL. Ensure your connection string is properly set in the .env.local file.

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env.local` file with the following variables:
```
# Database Configuration
DATABASE_URL=your_postgres_url
POSTGRES_URL=your_postgres_url

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_aws_region
AWS_S3_BUCKET_NAME=your_bucket_name
AWS_CLOUDFRONT_DOMAIN=your_cloudfront_domain

# Amazon Polly Configuration
AWS_POLLY_REGION=your_polly_region

# OpenAI Configuration
OPENAI_API_KEY=your_openai_key
```
4. Initialize the database:
```bash
# Visit the /debug-database route or use the API
curl http://localhost:3000/api/setup
```
5. Run the development server:
```bash
npm run dev
```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Add celebrities via the "Add Celebrity" button
2. Create reels for the celebrities you've added
3. View the generated reels in the main feed
4. Each reel will have:
   - AI-generated script
   - Text-to-speech narration
   - AI-generated images
   - Combined video of images and audio

## API Documentation

The application provides several API endpoints:

- `GET /api/reels` - Get all reels
- `GET /api/reels/{id}` - Get a specific reel
- `POST /api/reels` - Create a new reel
- `GET /api/celebrities` - Get all celebrities
- `POST /api/celebrities` - Add a new celebrity
- `GET /api/setup` - Initialize database tables

For detailed documentation, visit the `/api-docs` route in the application.

## Tech Stack

- **Frontend:** Next.js, React, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** Neon PostgreSQL
- **AI Services:** OpenAI (GPT-4, DALL-E 3)
- **Storage:** AWS S3, CloudFront
- **Text-to-Speech:** Amazon Polly
- **Video Processing:** FFmpeg
