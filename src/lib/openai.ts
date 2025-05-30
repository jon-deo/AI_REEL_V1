import OpenAI from 'openai';

// Initialize without organization ID, as it's causing authentication issues
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Removing organization to fix the mismatched_organization error
});

export async function generateSportsCelebrityScript(
  name: string,
  sport: string
): Promise<{ script: string; title: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a sports historian who creates brief, engaging historical narratives about sports celebrities. Create concise scripts suitable for short 30-60 second video reels. DO NOT include any narrator credits, audio attributions, or phrases like "narrated by" or "OpenAI shorts" in your response. The script should ONLY contain factual information about the athlete without any video-style openings or closings. Do not mention that this is a "short" or "reel" or any other video format. Do not include any call to action, subscription request, thanks for watching, or other social media style ending.',
        },
        {
          role: 'user',
          content: `Create a brief historical script about ${name}, a famous ${sport} athlete. The script should be engaging, informative, and suitable for a 30-60 second video reel. Include key achievements, records, and interesting facts about their career. Also provide a catchy title for this reel. DO NOT include any audio credits, references to shorts/videos, or speaker references. Write only factual information about the athlete without any video-style formatting or closings.`,
        },
      ],
      max_tokens: 400,
      temperature: 0.6,
    });

    const content = response.choices[0]?.message.content || '';
    
    // Extract title and script from the content
    const titleMatch = content.match(/Title:(.*?)(?:\n|$)/i);
    const title = titleMatch ? titleMatch[1].trim() : `${name}'s ${sport} Legacy`;
    
    // Remove the title line if found
    const script = content.replace(/Title:.*?(?:\n|$)/i, '').trim();

    return { script, title };
  } catch (error) {
    console.error('Error generating script:', error);
    throw error;
  }
}

export async function generateImagePrompt(
  name: string,
  sport: string,
  script: string
): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI that creates detailed image prompts for sports celebrities. Create vivid, photorealistic descriptions that will work well with DALL-E to generate high-quality images of the athlete.',
        },
        {
          role: 'user',
          content: `Create 3 detailed image prompts for ${name}, a famous ${sport} athlete. Each prompt should create a photorealistic, high-quality image showing the athlete in different scenarios:
1. A close-up portrait showing their face clearly
2. An action shot of them playing ${sport} 
3. A celebratory moment or iconic pose they're known for

Make each prompt very detailed with specific visual elements. Begin each prompt with "Photorealistic image of ${name}," and include physical details about the athlete.
Base the prompts on this information: ${script}`
        },
      ],
      max_tokens: 250,
      temperature: 0.6,
    });

    const content = response.choices[0]?.message.content || '';
    
    // Extract prompts - looking for numbered or bulleted list items
    const promptsArray = content
      .split(/\d+\.\s|\n-\s/)
      .filter(item => item.trim().length > 0)
      // No need to prepend name and sport as it's already included in our prompt
      .map(item => item.trim());
    
    return promptsArray.length ? promptsArray : [`Photorealistic image of ${name}, professional ${sport} athlete in action, high quality photograph, detailed facial features, 8k, studio lighting`];
  } catch (error) {
    console.error('Error generating image prompts:', error);
    return [`Photorealistic image of ${name}, professional ${sport} athlete in action, high quality photograph, detailed facial features, 8k, studio lighting`];
  }
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3", // Use DALL-E 3 for much higher quality images
      prompt: prompt.substring(0, 1000), // DALL-E 3 can handle longer prompts
      n: 1,
      size: "1024x1024",
      quality: "hd", // Use high definition quality
      response_format: "url",
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("No image data returned from OpenAI");
    }

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error("No image URL returned from OpenAI");
    }

    return imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
} 