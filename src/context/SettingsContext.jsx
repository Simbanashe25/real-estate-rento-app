import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/config';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    app_name: 'Rentor',
    app_logo: null,
    app_description: 'Your destination for finding the perfect home or room to rent.',
    contact_email: '',
    contact_phone: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching settings:', error);
      } else if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Settings fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
