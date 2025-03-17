import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useChatStore } from '@/lib/store';
import { ChatMessage, Conversation } from '@/lib/supabase';

/**
 * Hook to fetch WhatsApp connection status
 */
export function useWhatsAppStatus() {
  return useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: async () => {
      const response = await fetch('/api/whatsapp');
      if (!response.ok) {
        throw new Error('Failed to fetch WhatsApp status');
      }
      return response.json();
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

/**
 * Hook to initialize WhatsApp connection
 */
export function useInitializeWhatsApp() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to initialize WhatsApp');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-status'] });
    }
  });
}

/**
 * Hook to fetch all conversations
 */
export function useConversations() {
  const { setConversations, setLoading, setError } = useChatStore();

  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/conversations');
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error(errorData.message || 'Failed to fetch conversations');
        }
        const data = await response.json();
        setConversations(data.conversations || []);
        return data.conversations || [];
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error fetching conversations:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    refetchInterval: 10000, // Poll every 10 seconds
    retry: 1, // Retry once on failure
    retryDelay: 1000, // Wait 1 second before retrying
  });
}

/**
 * Hook to create a new conversation
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { setActiveConversation } = useChatStore();

  return useMutation({
    mutationFn: async ({ 
      user_phone, 
      user_name 
    }: { 
      user_phone: string; 
      user_name?: string;
    }) => {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_phone,
          user_name
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create conversation');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Set as active conversation if requested
      if (data.conversation) {
        setActiveConversation(data.conversation);
      }
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

/**
 * Hook to fetch messages for a specific conversation
 */
export function useMessages(conversationId: string | null) {
  const { setMessages, setLoading, setError } = useChatStore();

  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      setLoading(true);
      try {
        const response = await fetch(`/api/conversations/${conversationId}/messages`);
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error(errorData.message || 'Failed to fetch messages');
        }
        const data = await response.json();
        setMessages(conversationId, data.messages || []);
        return data.messages || [];
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error fetching messages:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!conversationId,
    refetchInterval: conversationId ? 3000 : false, // Poll every 3 seconds when conversation is active
    retry: 1, // Retry once on failure
    retryDelay: 1000, // Wait 1 second before retrying
  });
}

/**
 * Hook to send a message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { addMessage } = useChatStore();
  const [whatsappError, setWhatsappError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ 
      conversationId,
      content,
      sender_type = 'admin',
      media_url,
      media_type
    }: { 
      conversationId: string;
      content: string;
      sender_type?: 'user' | 'bot' | 'admin';
      media_url?: string;
      media_type?: string;
    }) => {
      // Clear any previous WhatsApp errors
      setWhatsappError(null);
      
      // Send message to conversation
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          sender_type,
          media_url,
          media_type
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
      
      const data = await response.json();
      
      // If this is an admin message, also send via WhatsApp API
      if (sender_type === 'admin') {
        // Get the conversation to get the phone number
        const conversationsData = await queryClient.getQueryData<Conversation[]>(['conversations']);
        const conversation = conversationsData?.find(c => c.id === conversationId);
        
        if (conversation) {
          // Send via WhatsApp API
          const whatsappResponse = await fetch('/api/whatsapp/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phone: conversation.user_phone,
              message: content,
              conversationId
            }),
          });
          
          if (!whatsappResponse.ok) {
            const whatsappError = await whatsappResponse.json();
            console.warn('WhatsApp message sending failed:', whatsappError);
            
            // Store the WhatsApp error message
            setWhatsappError(whatsappError.message || 'Failed to send WhatsApp message');
            
            // Don't throw error here, as the message was saved to the database
            // Just log the warning and continue
            if (whatsappError.error === 'WhatsApp client not initialized') {
              // Invalidate WhatsApp status to show the connect button
              queryClient.invalidateQueries({ queryKey: ['whatsapp-status'] });
            }
          }
        }
      }
      
      return data;
    },
    onSuccess: (data, variables) => {
      // Add message to store
      if (data.message) {
        addMessage(variables.conversationId, data.message);
      }
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
    }
  });

  return {
    ...mutation,
    whatsappError,
    clearWhatsappError: () => setWhatsappError(null)
  };
}

/**
 * Hook to take over a conversation (admin or bot)
 */
export function useTakeover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      action 
    }: { 
      conversationId: string; 
      action: 'admin' | 'bot';
    }) => {
      const response = await fetch('/api/whatsapp/takeover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          action,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to perform takeover');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
