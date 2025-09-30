import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mockWhatsAppContacts, mockWhatsAppConversations, mockWhatsAppMessages } from '@/lib/mock-data';
import { useSupabaseConnection } from './useSupabaseConnection';
import { toast } from 'sonner';

interface WhatsAppContact {
  id: string;
  phone: string;
  name: string;
  role: string;
  is_active: boolean;
}

interface WhatsAppMessage {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'bot';
  message_text: string;
  message_type: 'text' | 'image' | 'location' | 'template_response';
  template_data?: any;
  created_at: string;
}

interface WhatsAppConversation {
  id: string;
  contact_id: string;
  project_id: string;
  title: string;
  is_active: boolean;
  contact?: WhatsAppContact;
}

export function useWhatsAppPersistence() {
  const queryClient = useQueryClient();
  const { isConnected } = useSupabaseConnection();

  // Fetch contacts
  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: ['whatsapp-contacts'],
    queryFn: async () => {
      if (!isConnected) {
        return mockWhatsAppContacts as WhatsAppContact[];
      }
      
      const { data, error } = await supabase
        .from('whatsapp_contacts')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as WhatsAppContact[];
    }
  });

  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['whatsapp-conversations'],
    queryFn: async () => {
      if (!isConnected) {
        // Combinar conversaciones con contactos para mock data
        return mockWhatsAppConversations.map(conv => ({
          id: conv.id,
          contact_id: conv.contact_id,
          project_id: conv.project_id,
          title: mockWhatsAppContacts.find(c => c.id === conv.contact_id)?.name || 'Contacto',
          is_active: true,
          contact: mockWhatsAppContacts.find(c => c.id === conv.contact_id)
        })) as WhatsAppConversation[];
      }
      
      const { data, error } = await supabase
        .from('whatsapp_conversations')
        .select(`
          *,
          whatsapp_contacts (
            id, phone, name, role, is_active
          )
        `)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      // Fetch contact info separately
      const conversationsWithContacts = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: contact } = await supabase
            .from('whatsapp_contacts')
            .select('*')
            .eq('id', conv.contact_id)
            .maybeSingle();
          
          return {
            ...conv,
            contact: contact || undefined
          };
        })
      );
      
      return conversationsWithContacts as WhatsAppConversation[];
    }
  });

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    if (!isConnected) {
      return mockWhatsAppMessages.filter(msg => msg.conversation_id === conversationId).map(msg => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_type: (msg.direction === 'inbound' ? 'user' : 'bot') as 'user' | 'bot',
        message_text: msg.content,
        message_type: msg.message_type || 'text',
        created_at: msg.timestamp,
        template_data: undefined
      })) as WhatsAppMessage[];
    }
    
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Map database fields to interface
    const messages: WhatsAppMessage[] = (data || []).map(msg => ({
      id: msg.id,
      conversation_id: msg.conversation_id,
      sender_type: (msg.sender_type === 'user' || msg.sender_type === 'bot') ? msg.sender_type : 'bot',
      message_text: msg.message_text,
      message_type: msg.message_type || 'text',
      created_at: msg.created_at,
      template_data: msg.template_data
    })) as WhatsAppMessage[];
    
    return messages;
  };

  // Save message mutation
  const saveMessageMutation = useMutation({
    mutationFn: async ({ 
      conversationId, 
      senderType, 
      messageText, 
      messageType = 'text',
      templateData 
    }: {
      conversationId: string;
      senderType: 'user' | 'bot';
      messageText: string;
      messageType?: string;
      templateData?: any;
    }) => {
      const { error } = await supabase
        .from('whatsapp_messages')
        .insert({
          conversation_id: conversationId,
          sender_type: senderType,
          message_text: messageText,
          message_type: messageType,
          template_data: templateData
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate messages query to refetch
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages'] });
    },
    onError: (error) => {
      console.error('Error saving message:', error);
      toast.error('Error al guardar mensaje');
    }
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async ({
      contactId,
      projectId,
      title
    }: {
      contactId: string;
      projectId: string;
      title: string;
    }) => {
      const { data, error } = await supabase
        .from('whatsapp_conversations')
        .insert({
          contact_id: contactId,
          project_id: projectId,
          title
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      toast.success('Conversación creada exitosamente');
    }
  });

  // Export conversation data
  const exportConversation = async (conversationId: string, format: 'excel' | 'pdf' = 'excel') => {
    try {
      const messages = await fetchMessages(conversationId);
      const conversation = conversations?.find(c => c.id === conversationId);
      
      if (!conversation) {
        toast.error('Conversación no encontrada');
        return;
      }

      // Create downloadable content
      const csvContent = [
        ['Fecha', 'Remitente', 'Mensaje', 'Tipo'].join(','),
        ...messages.map(msg => [
          new Date(msg.created_at).toLocaleString(),
          msg.sender_type === 'user' ? conversation.contact?.name : 'Bot',
          `"${msg.message_text.replace(/"/g, '""')}"`,
          msg.message_type
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `conversacion_${conversation.contact?.name}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success('Conversación exportada exitosamente');
    } catch (error) {
      console.error('Error exporting conversation:', error);
      toast.error('Error al exportar conversación');
    }
  };

  return {
    contacts,
    conversations,
    contactsLoading,
    conversationsLoading,
    fetchMessages,
    saveMessage: saveMessageMutation.mutate,
    createConversation: createConversationMutation.mutate,
    exportConversation,
    isLoading: contactsLoading || conversationsLoading
  };
}