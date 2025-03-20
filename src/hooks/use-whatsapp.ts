import { useState, useEffect, useCallback } from 'react';

interface WhatsAppState {
  success: boolean;
  state: 'INITIALIZING' | 'QR_READY' | 'CONNECTED' | 'DISCONNECTED';
  qr: string | null;
  message: string;
}

export const useWhatsApp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whatsAppState, setWhatsAppState] = useState<WhatsAppState>({
    success: false,
    state: 'DISCONNECTED',
    qr: null,
    message: ''
  });
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  const checkSessionStatus = useCallback(async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3007/session/${id}/status`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to check WhatsApp session status');
      }

      setWhatsAppState(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check WhatsApp status';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const startSession = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First, initiate the session
      const response = await fetch('http://localhost:3007/start-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to start WhatsApp session');
      }

      setWhatsAppState(data);

      // Start polling for status updates
      if (pollInterval) clearInterval(pollInterval);
      const interval = setInterval(() => checkSessionStatus(id), 2000);
      setPollInterval(interval);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to WhatsApp';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up polling on unmount or when connected/disconnected
  useEffect(() => {
    if ((whatsAppState.state === 'CONNECTED' || whatsAppState.state === 'DISCONNECTED') && pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        setPollInterval(null);
      }
    };
  }, [whatsAppState.state, pollInterval]);

  return {
    startSession,
    isLoading,
    error,
    whatsAppState
  };
};
