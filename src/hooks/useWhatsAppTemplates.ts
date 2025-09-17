import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mockWhatsAppTemplates } from '@/lib/mock-data';
import { useSupabaseConnection } from './useSupabaseConnection';
import { toast } from 'sonner';

interface WhatsAppTemplate {
  id: string;
  name: string;
  template_type: 'menu' | 'survey' | 'progress_form' | 'alert_form';
  content: {
    title: string;
    options?: Array<{ id: string; text: string; }>;
    fields?: Array<{ 
      name: string; 
      type: string; 
      label?: string; 
      options?: string[]; 
    }>;
  };
  is_active: boolean;
}

export function useWhatsAppTemplates() {
  const queryClient = useQueryClient();
  const { isConnected } = useSupabaseConnection();

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: async () => {
      if (!isConnected) {
        // Convertir mock templates al formato esperado
        return mockWhatsAppTemplates.map(template => ({
          id: template.id,
          name: template.name,
          template_type: 'progress_form' as const,
          content: {
            title: template.name,
            fields: template.variables.map(variable => ({
              name: variable,
              type: 'text',
              label: variable.charAt(0).toUpperCase() + variable.slice(1)
            }))
          },
          is_active: template.is_active
        })) as WhatsAppTemplate[];
      }
      
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as unknown as WhatsAppTemplate[];
    }
  });

  // Get template by type
  const getTemplateByType = (type: string) => {
    return templates?.find(t => t.template_type === type);
  };

  // Process template response
  const processTemplateResponse = (templateId: string, response: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (!template) return null;

    switch (template.template_type) {
      case 'menu':
        const option = template.content.options?.find(opt => 
          opt.id === response || opt.text.toLowerCase().includes(response.toLowerCase())
        );
        return option ? {
          type: 'menu_selection',
          selected: option,
          template: template
        } : null;

      case 'progress_form':
        // Parse structured response for progress forms
        try {
          const data = JSON.parse(response);
          return {
            type: 'progress_data',
            data: data,
            template: template
          };
        } catch {
          return {
            type: 'progress_text',
            text: response,
            template: template
          };
        }

      case 'survey':
      case 'alert_form':
        return {
          type: template.template_type,
          response: response,
          template: template
        };

      default:
        return null;
    }
  };

  // Generate interactive menu response
  const generateMenuResponse = (template: WhatsAppTemplate) => {
    if (template.template_type !== 'menu') return '';

    let response = `*${template.content.title}*\n\n`;
    template.content.options?.forEach((option, index) => {
      response += `${index + 1}. ${option.text}\n`;
    });
    response += '\nResponde con el número de tu opción.';
    
    return response;
  };

  // Generate form response
  const generateFormResponse = (template: WhatsAppTemplate) => {
    if (template.template_type !== 'progress_form') return '';

    let response = `*${template.content.title}*\n\n`;
    response += 'Por favor proporciona la siguiente información:\n\n';
    
    template.content.fields?.forEach((field, index) => {
      response += `${index + 1}. ${field.label || field.name}`;
      if (field.type === 'select' && field.options) {
        response += ` (${field.options.join(', ')})`;
      }
      response += '\n';
    });
    
    response += '\nPuedes responder en formato:\n';
    response += '```\n';
    template.content.fields?.forEach(field => {
      response += `${field.name}: [tu respuesta]\n`;
    });
    response += '```';
    
    return response;
  };

  return {
    templates,
    isLoading,
    getTemplateByType,
    processTemplateResponse,
    generateMenuResponse,
    generateFormResponse
  };
}