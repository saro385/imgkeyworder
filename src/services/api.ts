// Constants
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

// Types
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

// Helper Functions
const getBase64FromFile = async (file: File | Blob): Promise<string> => {
  if (!file) {
    throw new Error('No file provided');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      } catch (error) {
        reject(new Error('Failed to process file'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
};

const makeGeminiRequest = async (
  apiKey: string,
  prompt: string,
  base64Image: string,
  mimeType: string
): Promise<GeminiResponse> => {
  const response = await fetch(`${GEMINI_API_BASE_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Image
            }
          }
        ]
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
};

const parseKeywords = (text: string): string[] => {
  // Remove any numbers and special characters
  const cleanText = text.replace(/\d+\.\s*/g, '')  // Remove numbered lists
                      .replace(/keywords?:?\s*/gi, '') // Remove "keywords:" prefix
                      .replace(/\([^)]*\)/g, ''); // Remove parentheses and their contents
  
  // Split by commas or newlines and clean up each keyword
  return cleanText
    .split(/[,\n]+/)
    .map(k => k.trim())
    .filter(k => k && k.length > 0) // Remove empty strings
    .map(k => k.toLowerCase()) // Convert to lowercase
    .filter((k, i, arr) => arr.indexOf(k) === i); // Remove duplicates
};

// Main API Function
export async function processImageWithGemini(
  imageResult: { file: File; status: string },
  apiKey: string,
  descriptionPrompt: string,
  keywordPrompt: string
) {
  if (!imageResult?.file) {
    throw new Error('No image file provided');
  }

  try {
    const base64Image = await getBase64FromFile(imageResult.file);

    // Get description
    const descriptionResponse = await makeGeminiRequest(
      apiKey,
      descriptionPrompt,
      base64Image,
      imageResult.file.type
    );
    
    const description = descriptionResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    // Get keywords
    const keywordResponse = await makeGeminiRequest(
      apiKey,
      keywordPrompt,
      base64Image,
      imageResult.file.type
    );

    const keywordsText = keywordResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const keywords = parseKeywords(keywordsText);

    return {
      description,
      keywords
    };
  } catch (error) {
    console.error('Error in processImageWithGemini:', error);
    throw error;
  }
}
