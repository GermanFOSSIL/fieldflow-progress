import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConnectionStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useSupabaseConnection() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isLoading: false,
    error: 'Offline mode - using mock data'
  });

  // Modo offline forzado - siempre usar datos mock
  useEffect(() => {
    console.log('🔌 Modo offline activado - usando datos mock');
    setStatus({
      isConnected: false,
      isLoading: false,
      error: 'Offline mode - using mock data'
    });
  }, []);

  return status;
}

