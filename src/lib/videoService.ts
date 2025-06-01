import { generateSportsCelebrityScript, generateImagePrompt, generateImage } from './openai';
import { textToSpeech, uploadToS3 } from './aws';
import { VoiceId } from '@aws-sdk/client-polly';
import { createCelebrity, createReel, updateReelStatus, getCelebrityByNameAndSport } from './db';
import crypto from 'crypto';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

interface VideoRequest {
  name: string;
  sport: string;
  description?: string;
  celebrity_id?: number;
}

interface VideoData {
  title: string;
  script: string;
  audioUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
  celebrity: {
    id: number;
    name: string;
    sport: string;
  };
}

async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  const writer = fs.createWriteStream(outputPath);

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    let error: Error | null = null;
    writer.on('error', err => {
      error = err;
      writer.close();
      reject(err);
    });
    writer.on('close', () => {
      if (!error) {
        resolve();
      }
    });
  });
}

async function createVideoFromImagesAndAudio(
  imageFiles: string[],
  audioFile: string,
  outputFile: string,
  duration: number = 30
): Promise<void> {
  try {
    // Upload images to Cloudinary and store both URLs and public_ids
    const imageUploadPromises = imageFiles.map(async (imagePath) => {
      const result = await cloudinary.uploader.upload(imagePath, {
        resource_type: 'image',
        folder: 'sports-reels'
      });
      return {
        url: result.secure_url,
        public_id: result.public_id
      };
    });

    // Upload audio to Cloudinary
    const audioResult = await cloudinary.uploader.upload(audioFile, {
      resource_type: 'video',
      folder: 'sports-reels'
    });

    const uploadedImages = await Promise.all(imageUploadPromises);

    // Create video using Cloudinary's upload API
    const result = await cloudinary.uploader.upload(uploadedImages[0].url, {
      resource_type: 'video',
      format: 'mp4',
      transformation: {
        fetch_format: 'mp4',
        video_codec: 'auto',
        audio_codec: 'aac',
        audio_url: audioResult.secure_url,
        transition: 'fade:1000',
        duration: duration,
        overlay: uploadedImages.map((image, index) => ({
          resource_type: 'image',
          public_id: image.public_id,
          start_offset: index * (duration / uploadedImages.length),
          end_offset: (index + 1) * (duration / uploadedImages.length)
        }))
      }
    });

    if (!result || !result.secure_url) {
      throw new Error('Failed to create video: No URL returned from Cloudinary');
    }

    console.log('Video created successfully:', result.secure_url);

    // Download the final video
    const response = await axios({
      url: result.secure_url,
      method: 'GET',
      responseType: 'stream',
      timeout: 30000 // 30 second timeout
    });

    const writer = fs.createWriteStream(outputFile);
    response.data.pipe(writer);

    return new Promise<void>((resolve, reject) => {
      writer.on('finish', () => resolve());
      writer.on('error', reject);
    });

  } catch (error: any) {
    console.error('Error creating video:', error);
    if (error.response) {
      console.error('Cloudinary API response:', error.response.data);
    }
    throw error;
  }
}

async function getCelebrityImagesFromUnsplash(
  name: string,
  sport: string,
  tempDir: string,
  count: number = 3
): Promise<string[]> {
  try {
    console.log(`Fetching real ${count} photos of ${name} from Unsplash...`);

    // Format query parameters
    const formattedName = name.replace(/\s+/g, '-').toLowerCase();
    const formattedSport = sport.replace(/\s+/g, '-').toLowerCase();

    // Create parallel download promises for different image variations
    const downloadPromises = [];

    // Try different query combinations to increase chances of getting relevant images
    const queries = [
      `${formattedName}`,
      `${formattedName}-${formattedSport}-player`,
      `${formattedSport}-${formattedName}`,
    ];

    // Add extra general queries as fallbacks
    if (count > queries.length) {
      queries.push(`${formattedSport}-player`, `${formattedSport}-athlete`);
    }

    // Use only the number of queries we need
    const queriesNeeded = queries.slice(0, count);

    for (let i = 0; i < queriesNeeded.length; i++) {
      // Use Unsplash API with proper headers
      const imageUrl = `https://source.unsplash.com/featured/?${queriesNeeded[i]},athlete`;
      const localPath = path.join(tempDir, `unsplash-${i}.jpg`);

      downloadPromises.push(
        (async () => {
          try {
            console.log(`Downloading image for query "${queriesNeeded[i]}"...`);
            const response = await axios({
              url: imageUrl,
              method: 'GET',
              responseType: 'stream',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              },
              timeout: 10000 // 10 second timeout
            });

            const writer = fs.createWriteStream(localPath);
            response.data.pipe(writer);

            await new Promise<void>((resolve, reject) => {
              writer.on('finish', () => resolve());
              writer.on('error', reject);
            });

            // Verify the file exists and has reasonable size
            if (fs.existsSync(localPath) && fs.statSync(localPath).size > 10000) {
              console.log(`✅ Successfully downloaded image for "${queriesNeeded[i]}"`);
              return localPath;
            } else {
              console.log(`❌ Downloaded image for "${queriesNeeded[i]}" is too small or invalid`);
              return null;
            }
          } catch (err) {
            console.error(`Failed to download image for "${queriesNeeded[i]}":`, err);
            return null;
          }
        })()
      );
    }

    // Wait for all downloads to complete and filter out nulls
    const results = await Promise.all(downloadPromises);
    const validImages = results.filter(Boolean) as string[];

    console.log(`Downloaded ${validImages.length} valid images from Unsplash`);
    return validImages;
  } catch (error) {
    console.error('Error fetching images from Unsplash:', error);
    return [];
  }
}

export async function generateSportsCelebrityVideo(
  request: VideoRequest
): Promise<VideoData> {
  try {
    const { name, sport, description, celebrity_id } = request;
    const tempDir = path.join(tmpdir(), `sports-reel-${Date.now()}`);

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Create or get celebrity - Keep this synchronous to ensure we have the celebrity ID
    let celebrity;
    if (celebrity_id) {
      // If celebrity_id is provided, use it
      celebrity = { id: celebrity_id, name, sport };
    } else {
      // Check if celebrity already exists
      const existingCelebrity = await getCelebrityByNameAndSport(name, sport);

      if (existingCelebrity) {
        // Use existing celebrity
        celebrity = existingCelebrity;
      } else {
        // Create new celebrity only if it doesn't exist
        celebrity = await createCelebrity({
          name,
          sport,
          description
        });
      }
    }

    // Generate unique identifiers for files - do this early so we can run tasks in parallel
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const audioFileName = `audio/${uniqueId}-${name.replace(/\s+/g, '-').toLowerCase()}.mp3`;
    const videoFileName = `videos/${uniqueId}-${name.replace(/\s+/g, '-').toLowerCase()}.mp4`;
    const thumbnailFileName = `thumbnails/${uniqueId}-${name.replace(/\s+/g, '-').toLowerCase()}.jpg`;

    const localAudioPath = path.join(tempDir, 'audio.mp3');
    const localVideoPath = path.join(tempDir, 'video.mp4');

    // Step 1: Generate script
    const scriptPromise = generateSportsCelebrityScript(name, sport);

    // Wait for script before proceeding (required for audio and images)
    const { script, title } = await scriptPromise;
    const cleanedScript = cleanScript(script);

    // Run audio generation and image fetching in parallel
    const [audioResult, imagePrompts] = await Promise.all([
      // Audio generation
      (async () => {
        const audioBuffer = await textToSpeech(cleanedScript, audioFileName, VoiceId.Matthew);
        fs.writeFileSync(localAudioPath, audioBuffer);
        return { audioBuffer, audioPath: localAudioPath };
      })(),

      // Still generate image prompts as fallback
      generateImagePrompt(name, sport, cleanedScript)
    ]);

    // First try to get real images from Unsplash
    const unsplashImages = await getCelebrityImagesFromUnsplash(name, sport, tempDir, 3);

    // If we got enough Unsplash images, use them
    let localImagePaths: string[] = [];
    if (unsplashImages.length >= 2) {
      console.log('Using real images from Unsplash');
      localImagePaths = unsplashImages;
    } else {
      // Fall back to AI-generated images if we couldn't get enough real photos
      console.log('Insufficient Unsplash images, falling back to AI-generated images');

      // Reduce to 2-3 images instead of 3-5 to speed up process
      const numImages = Math.min(3, Math.max(2, imagePrompts.length));

      // Generate images in parallel
      const imagePromises = [];
      for (let i = 0; i < numImages; i++) {
        const prompt = imagePrompts[i] || imagePrompts[0];
        imagePromises.push(generateAndDownloadImage(prompt, tempDir, i));
      }

      // Wait for all images
      localImagePaths = (await Promise.all(imagePromises))
        .filter(Boolean) as string[];

      // If we still don't have any images, try one more approach with Unsplash
      if (localImagePaths.length === 0) {
        console.log('No AI-generated images were successful, trying more generic Unsplash queries');

        // Try more generic queries as a last resort
        const genericSportImages = await Promise.all([
          downloadGenericImage(`${sport.toLowerCase()}-professional`, tempDir, 'sport-1'),
          downloadGenericImage(`${sport.toLowerCase()}-athlete`, tempDir, 'sport-2'),
          downloadGenericImage(`${sport.toLowerCase()}-star`, tempDir, 'sport-3')
        ]);

        localImagePaths = genericSportImages.filter(Boolean) as string[];
      }
    }

    // If we still have no images, use a placeholder
    if (localImagePaths.length === 0) {
      console.log('No images were obtained from any source, using a backup placeholder');
      const placeholderImage = path.join(tempDir, 'placeholder.png');
      const sportKeyword = sport.toLowerCase().replace(/\s+/g, '-');

      // Use Unsplash for a generic sport photo as absolute last resort
      const placeholderUrl = `https://source.unsplash.com/featured/?${sportKeyword},athlete`;
      console.log(`Using generic Unsplash sport photo as final fallback: ${placeholderUrl}`);

      await downloadFile(placeholderUrl, placeholderImage);
      localImagePaths.push(placeholderImage);
    }

    // Use first image as thumbnail, but upload in parallel with video creation
    const thumbnailBuffer = fs.readFileSync(localImagePaths[0]);

    // Parallel operations: S3 audio upload + Video creation + Thumbnail upload 
    const [audioUrl, , thumbnailUrl] = await Promise.all([
      // Upload audio to S3
      uploadToS3(audioResult.audioBuffer, audioFileName, 'audio/mpeg'),

      // Create video from images and audio - this is CPU intensive
      createVideoFromImagesAndAudio(
        localImagePaths,
        localAudioPath,
        localVideoPath,
        30 // 30 seconds video duration
      ),

      // Upload thumbnail in parallel
      uploadToS3(thumbnailBuffer, thumbnailFileName, 'image/jpeg')
    ]);

    // Upload video to S3 (has to happen after video creation)
    const videoBuffer = fs.readFileSync(localVideoPath);
    const videoUrl = await uploadToS3(videoBuffer, videoFileName, 'video/mp4');

    // Clean up temp directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (err) {
      console.error('Error cleaning up temp directory:', err);
    }

    // Create reel in the database
    const reel = await createReel({
      celebrity_id: celebrity.id,
      title,
      description: cleanedScript.substring(0, 255),
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl
    });

    // Set status to completed
    await updateReelStatus(reel.id, 'completed');

    return {
      title,
      script: cleanedScript,
      audioUrl,
      videoUrl,
      thumbnailUrl,
      celebrity: {
        id: celebrity.id,
        name: celebrity.name,
        sport: celebrity.sport
      }
    };
  } catch (error) {
    console.error('Error generating sports celebrity video:', error);
    throw error;
  }
}

// Helper function to generate and download an image in one step
async function generateAndDownloadImage(prompt: string, tempDir: string, index: number): Promise<string | null> {
  try {
    console.log(`Generating image ${index} with prompt: ${prompt.substring(0, 100)}...`);
    const imageUrl = await generateImage(prompt);

    // Log success and the URL
    console.log(`✅ Image ${index} generated successfully: ${imageUrl.substring(0, 50)}...`);

    const imagePath = path.join(tempDir, `image-${index}.png`);
    await downloadFile(imageUrl, imagePath);

    // Verify the file exists and has content
    const fileExists = fs.existsSync(imagePath);
    const fileSize = fileExists ? fs.statSync(imagePath).size : 0;

    console.log(`Image ${index} downloaded to ${imagePath}, size: ${fileSize} bytes, exists: ${fileExists}`);

    if (!fileExists || fileSize < 1000) { // If file doesn't exist or is too small
      console.error(`Image ${index} download failed or file is too small`);
      return null;
    }

    return imagePath;
  } catch (err) {
    console.error(`Error generating/downloading image ${index}:`, err);
    return null;
  }
}

// Helper function to clean script before TTS
function cleanScript(script: string): string {
  // Remove any mentions of "OpenAI shorts", "shorts" credits or attribution
  return script
    .replace(/\b(?:open\s*ai\s*shorts|shorts\s*by\s*open\s*ai)\b/gi, '')
    .replace(/\b(?:this\s*is\s*(?:a\s*)?shorts?)\b/gi, '')
    .replace(/\b(?:brought\s*to\s*you\s*by|powered\s*by|created\s*by|generated\s*by|presented\s*by)\s*(?:open\s*ai|shorts|gpt\d*)\b/gi, '')
    .replace(/\b(?:shorts|video|reel)(?:\s*(?:produced|created|made|generated))?\s*(?:by|with|using)\s*(?:open\s*ai|gpt\d*)\b/gi, '')
    .replace(/\b(?:thanks\s*for\s*watching|subscribe|like|comment)\b/gi, '')
    .trim()
    .replace(/\n{3,}/g, '\n\n'); // Clean up excessive newlines
}

// Add a helper function for downloading generic images
async function downloadGenericImage(query: string, tempDir: string, filename: string): Promise<string | null> {
  try {
    const imageUrl = `https://source.unsplash.com/featured/?${query}`;
    const localPath = path.join(tempDir, `${filename}.jpg`);

    await downloadFile(imageUrl, localPath);

    if (fs.existsSync(localPath) && fs.statSync(localPath).size > 10000) {
      return localPath;
    }
    return null;
  } catch (error) {
    console.error(`Error downloading generic image for ${query}:`, error);
    return null;
  }
} 