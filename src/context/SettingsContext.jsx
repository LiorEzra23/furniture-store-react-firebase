import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { defaultSettings, listenToSettings } from '../services/settingsService';

const SettingsContext = createContext(defaultSettings);
const SETTINGS_CACHE_KEY = 'furniture-store-settings';

function getInitialSettings() {
  try {
    const cachedSettings = localStorage.getItem(SETTINGS_CACHE_KEY);
    return cachedSettings ? { ...defaultSettings, ...JSON.parse(cachedSettings) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(getInitialSettings);

  useEffect(() => {
    const unsubscribe = listenToSettings((nextSettings) => {
      setSettings(nextSettings);

      try {
        localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(nextSettings));
      } catch {
        // Local storage can be blocked in private browsing modes.
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor);
    document.documentElement.style.setProperty('--text-color', settings.textColor);
  }, [settings]);

  const value = useMemo(() => settings, [settings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
