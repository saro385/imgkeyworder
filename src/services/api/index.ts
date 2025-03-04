import { APIProvider, ImageAnalysisResult, ProjectSettings } from '@/types';
import { analyzeImageWithGemini } from './gemini';
import { analyzeImageWithOpenAI } from './openai';
import { API_PROVIDERS } from '@/config/constants';

export async function analyzeImage(  // Added 'export' here
  imageBlob: Blob,
  provider: APIProvider,
  apiKey: string,
  projectSettings: ProjectSettings
): Promise<ImageAnalysisResult> {
  switch (provider) {
    case API_PROVIDERS.GEMINI:
      return analyzeImageWithGemini(imageBlob, apiKey, projectSettings);
    case API_PROVIDERS.OPENAI:
      return analyzeImageWithOpenAI(imageBlob, apiKey, projectSettings);
    default:
      throw new Error(`Unsupported API provider: ${provider}`);
  }
}
