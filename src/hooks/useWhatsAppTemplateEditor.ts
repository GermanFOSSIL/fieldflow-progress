import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

export function useWhatsAppTemplateEditor() {
  const queryClient = useQueryClient();

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: Omit<WhatsAppTemplate, 'id'>) => {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .insert({
          name: templateData.name,
          template_type: templateData.template_type,
          content: templateData.content,
          is_active: templateData.is_active
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      throw error;
    }
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, templateData }: { 
      id: string; 
      templateData: Partial<WhatsAppTemplate> 
    }) => {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .update({
          name: templateData.name,
          template_type: templateData.template_type,
          content: templateData.content,
          is_active: templateData.is_active
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      throw error;
    }
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('whatsapp_templates')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      throw error;
    }
  });

  // Duplicate template mutation
  const duplicateTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      // First, get the original template
      const { data: originalTemplate, error: fetchError } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;

      // Create a copy with modified name
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .insert({
          name: `${originalTemplate.name} (Copia)`,
          template_type: originalTemplate.template_type,
          content: originalTemplate.content,
          is_active: true
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });
    },
    onError: (error) => {
      console.error('Error duplicating template:', error);
      throw error;
    }
  });

  // Validate template data
  const validateTemplate = (templateData: Partial<WhatsAppTemplate>): string[] => {
    const errors: string[] = [];

    if (!templateData.name?.trim()) {
      errors.push('El nombre es obligatorio');
    }

    if (!templateData.content?.title?.trim()) {
      errors.push('El título es obligatorio');
    }

    if (templateData.template_type === 'menu') {
      if (!templateData.content?.options?.length) {
        errors.push('Debe tener al menos una opción');
      }
      templateData.content?.options?.forEach((option, index) => {
        if (!option.text?.trim()) {
          errors.push(`La opción ${index + 1} no puede estar vacía`);
        }
      });
    }

    if (templateData.template_type !== 'menu') {
      if (!templateData.content?.fields?.length) {
        errors.push('Debe tener al menos un campo');
      }
      templateData.content?.fields?.forEach((field, index) => {
        if (!field.name?.trim()) {
          errors.push(`El campo ${index + 1} debe tener un nombre`);
        }
        if (field.type === 'select' && (!field.options?.length || field.options.some(opt => !opt.trim()))) {
          errors.push(`El campo "${field.name}" de tipo selección debe tener opciones válidas`);
        }
      });
    }

    return errors;
  };

  return {
    createTemplate: async (templateData: Omit<WhatsAppTemplate, 'id'>) => {
      const errors = validateTemplate(templateData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      return createTemplateMutation.mutateAsync(templateData);
    },
    
    updateTemplate: async (id: string, templateData: Partial<WhatsAppTemplate>) => {
      const errors = validateTemplate(templateData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      return updateTemplateMutation.mutateAsync({ id, templateData });
    },
    
    deleteTemplate: deleteTemplateMutation.mutateAsync,
    duplicateTemplate: duplicateTemplateMutation.mutateAsync,
    
    isCreating: createTemplateMutation.isPending,
    isUpdating: updateTemplateMutation.isPending,
    isDeleting: deleteTemplateMutation.isPending,
    isDuplicating: duplicateTemplateMutation.isPending,
    
    validateTemplate
  };
}