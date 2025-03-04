export interface ImageResult {
  file: File;
  thumbnail?: Blob;
  output?: ImageAnalysisResult;
  preview?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface ImageAnalysisResult {
  description: string;
  keywords: string[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  images: ImageResult[];
}

export interface LicenseState {
  isAuthenticated: boolean;
  hasChecked: boolean;
}

export interface APIKeys {
  gemini?: string;
  openai?: string;
}

export type APIProvider = 'gemini' | 'openai';

export interface Settings {
  apiProvider: APIProvider;
  apiKeys: APIKeys;
}

export interface ProjectSettings {
  maxDescriptionCharacters: number;
  keywordCount: number;
}
