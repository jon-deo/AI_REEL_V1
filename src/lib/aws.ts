import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import {
  PollyClient,
  SynthesizeSpeechCommand,
  VoiceId,
  OutputFormat,
} from '@aws-sdk/client-polly';
import { Readable } from 'stream';

// Configure AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Configure AWS Polly client
const pollyClient = new PollyClient({
  region: process.env.AWS_POLLY_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
    };

    await s3Client.send(new PutObjectCommand(params));
    
    // Return CloudFront URL for the uploaded file
    return `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${fileName}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

export async function textToSpeech(
  text: string,
  outputFileName: string,
  voiceId: VoiceId = VoiceId.Matthew
): Promise<Buffer> {
  try {
    const params = {
      Text: text,
      OutputFormat: OutputFormat.MP3,
      VoiceId: voiceId,
    };

    const response = await pollyClient.send(new SynthesizeSpeechCommand(params));
    
    if (!response.AudioStream) {
      throw new Error('No audio stream returned from Polly');
    }
    
    // Convert Readable to Buffer
    return streamToBuffer(response.AudioStream as unknown as Readable);
  } catch (error) {
    console.error('Error converting text to speech:', error);
    throw error;
  }
}

// Helper function to convert Node.js Readable stream to Buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
} 