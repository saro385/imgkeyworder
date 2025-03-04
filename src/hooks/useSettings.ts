import { useState, useEffect } from 'react';
import { Settings, APIProvider } from '@/types';
import { API_PROVIDERS } from '@/config/constants';

const SETTINGS_KEY = 'app_settings';

const defaultSettings: Settings = {
  apiProvider: API_PROVIDERS.GEMINI,
  apiKeys: {},
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateAPIKey = (provider: APIProvider, key: string) => {
    setSettings(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [provider]: key
      }
    }));
  };

  return {
    settings,
    updateSettings,
    updateAPIKey,
  };
}
