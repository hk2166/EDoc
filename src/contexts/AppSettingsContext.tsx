import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, LLMProvider } from '../types';
import localforage from 'localforage';

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isStorageReady: boolean;
}

const defaultSettings: AppSettings = {
  language: 'en',
  theme: 'system',
  privacyMode: true,
  notificationsEnabled: false,
  llmProvider: 'openai',
  dataRetentionDays: 30,
  analyticsOptIn: false,
};

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const useAppSettings = (): AppSettingsContextType => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isStorageReady, setIsStorageReady] = useState<boolean>(false);

  // Initialize localforage
  useEffect(() => {
    const initLocalForage = async () => {
      try {
        await localforage.ready();
        console.log('LocalForage initialized successfully');
        setIsStorageReady(true);
      } catch (error) {
        console.error('Failed to initialize LocalForage:', error);
        setError('Failed to initialize storage. Some features may not work properly.');
        setIsStorageReady(false);
      }
    };

    initLocalForage();
  }, []);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!isStorageReady) return;

      try {
        const savedSettings = await localforage.getItem<AppSettings>('appSettings');
        if (savedSettings) {
          setSettings(savedSettings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        setError('Failed to load settings. Using default settings.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [isStorageReady]);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    if (!isStorageReady) {
      console.warn('Storage not ready, settings update skipped');
      return;
    }

    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await localforage.setItem('appSettings', updatedSettings);
      
      // Apply theme changes immediately
      if (newSettings.theme) {
        applyTheme(newSettings.theme);
      }
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      setError('Failed to save settings. Changes may not persist.');
      throw error;
    }
  };

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    // Ensure DOM is ready
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemPreference);
    } else {
      root.classList.add(theme);
    }
  };

  // Apply theme on initial load
  useEffect(() => {
    if (!isLoading && typeof document !== 'undefined') {
      applyTheme(settings.theme);
    }
  }, [isLoading, settings.theme]);

  if (error) {
    console.warn('AppSettingsContext error:', error);
  }

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings, isLoading, error, isStorageReady }}>
      {children}
    </AppSettingsContext.Provider>
  );
};