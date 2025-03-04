import { API_CONFIG, API_PROVIDERS } from '@/config/constants';
import { ImageAnalysisResult, ProjectSettings } from '@/types';
import { getBase64FromBlob, createThumbnail } from '@/utils/image';

export async function analyzeImageWithOpenAI(
  imageBlob: Blob,
  apiKey: string,
  projectSettings: ProjectSettings
): Promise<ImageAnalysisResult> {
  const thumbnailBlob = await createThumbnail(imageBlob);
  const base64Image = await getBase64FromBlob(thumbnailBlob);
  const config = API_CONFIG[API_PROVIDERS.OPENAI];

  // Construct the combined prompt
  const combinedPrompt = `Describe the image in detail, suitable for a stock image description, and keep it under ${projectSettings.maxDescriptionCharacters} characters. Provide ${projectSettings.keywordCount} single-word keywords separated by commas.`;

  // Make a single request to the OpenAI API
  const response = await makeOpenAIRequest(
    config.baseUrl,
    apiKey,
    combinedPrompt,
    base64Image,
    config.model
  );

  const combinedText = response.choices?.[0]?.message?.content?.trim() || '';

  // Split the combined response into description and keywords
  let description = '';
  let keywords: string[] = [];

  const lines = combinedText.split('\n');
  if (lines.length > 0) {
      description = lines[0].trim().substring(0, projectSettings.maxDescriptionCharacters); // Get the first line as the description
  }
  if (lines.length > 1) {
      keywords = parseKeywords(lines.slice(1).join('\n')); // Get the rest as keywords
  }

  // Ensure the keyword count matches the setting
  while (keywords.length < projectSettings.keywordCount) {
      keywords.push(""); // Pad with empty strings
  }
  keywords = keywords.slice(0, projectSettings.keywordCount); // Trim if too many

  return { description, keywords };
}

async function makeOpenAIRequest(
  baseUrl: string,
  apiKey: string,
  prompt: string,
  base64Image: string,
  model: string
) {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API call failed: ${response.statusText}`);
  }

  return response.json();
}

function parseKeywords(text: string): string[] {
  const cleanText = text.replace(/\d+\.\s*/g, '')
                      .replace(/keywords?:?\s*/gi, '')
                      .replace(/\([^)]*\)/g, '');
  
  return cleanText
    .split(/[,\n]+/)
    .map(k => k.trim())
    .filter(k => k && k.length > 0)
    .map(k => k.toLowerCase())
    .filter((k, i, arr) => arr.indexOf(k) === i);
  }
