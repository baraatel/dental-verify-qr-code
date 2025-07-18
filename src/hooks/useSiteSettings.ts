
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
}

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      console.log('Fetching site settings from database');
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) {
        console.error('Error fetching site settings:', error);
        throw error;
      }

      console.log('Fetched site settings:', data);
      return data as SiteSetting[];
    },
  });
};

export const useSiteSetting = (key: string) => {
  const { data: settings, isLoading, error } = useSiteSettings();
  
  const setting = settings?.find(s => s.key === key);
  
  return {
    value: setting?.value || null,
    isLoading,
    error
  };
};
