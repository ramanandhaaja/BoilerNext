import { useState, useEffect, useCallback } from 'react';

interface WhatsAppStatus {
  status: 'not_initialized' | 'connected' | 'disconnected';
  qrCode: string | null;
  clientInfo: {
    pushname: string;
    wid: string;
    platform: string;
  } | null;
}

interface UseWhatsAppClientReturn {
  status: WhatsAppStatus | null;
  isLoading: boolean;
  error: Error | null;
  initializeClient: () => Promise<void>;
  logoutClient: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export function useWhatsAppClient(): UseWhatsAppClientReturn {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/whatsapp');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch WhatsApp status: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initializeClient = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to initialize WhatsApp client: ${response.statusText}`);
      }
      
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
    }
  }, [fetchStatus]);

  const logoutClient = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/whatsapp', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to logout WhatsApp client: ${response.statusText}`);
      }
      
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
    }
  }, [fetchStatus]);

  const refreshStatus = useCallback(async () => {
    await fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    fetchStatus();
    
    // Poll for status updates every 5 seconds when QR code is present
    const intervalId = setInterval(() => {
      if (status?.qrCode) {
        fetchStatus();
      }
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [fetchStatus, status?.qrCode]);

  return {
    status,
    isLoading,
    error,
    initializeClient,
    logoutClient,
    refreshStatus,
  };
}
