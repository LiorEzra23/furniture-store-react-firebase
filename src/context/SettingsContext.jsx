import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { defaultSettings, listenToSettings } from '../services/settingsService';

const SettingsContext = createContext(defaultSettings);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const unsubscribe = listenToSettings(setSettings);
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
