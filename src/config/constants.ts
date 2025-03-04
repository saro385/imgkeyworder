export const MAX_IMAGES = 100;
export const MAX_IMAGE_SIZE_MB = 20;
export const THUMBNAIL_SIZE = 800; // max width/height for thumbnails

export const API_PROVIDERS = {
  GEMINI: 'gemini',
  OPENAI: 'openai'
} as const;

export const API_CONFIG = {
  [API_PROVIDERS.GEMINI]: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent'
  },
  [API_PROVIDERS.OPENAI]: {
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4-vision-preview'
  }
};

export const DEFAULT_PROJECT_SETTINGS = {
  maxDescriptionCharacters: 200,
  keywordCount: 30,
};
