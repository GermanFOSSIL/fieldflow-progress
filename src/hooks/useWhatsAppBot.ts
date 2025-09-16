import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWhatsAppPersistence } from './useWhatsAppPersistence';
import { useWhatsAppTemplates } from './useWhatsAppTemplates';

interface ChatMessage {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'bot';
  type: 'text' | 'report' | 'alert' | 'inventory' | 'weather' | 'location' | 'template';
  metadata?: any;
}

interface ProjectData {
  projectName: string;
  activities: {
    name: string;
    progress: number;
    status: 'completed' | 'in-progress' | 'delayed' | 'pending';
  }[];
  materials: {
    name: string;
    quantity: number;
    unit: string;
    status: 'available' | 'low' | 'out';
  }[];
  weather: {
    today: string;
    tomorrow: string;
    dayAfter: string;
  };
}

// Datos simulados del proyecto
const mockProjectData: ProjectData = {
  projectName: "Edificio Central - Las Condes",
  activities: [
    { name: "Fundaciones", progress: 85, status: 'in-progress' },
    { name: "Estructura", progress: 60, status: 'in-progress' },
    { name: "Instalaciones Eléctricas", progress: 25, status: 'in-progress' },
    { name: "Instalaciones Sanitarias", progress: 15, status: 'pending' },
    { name: "Terminaciones", progress: 0, status: 'pending' }
  ],
  materials: [
    { name: "Cemento", quantity: 245, unit: "sacos", status: 'available' },
    { name: "Acero", quantity: 12, unit: "toneladas", status: 'available' },
    { name: "Agregados", quantity: 150, unit: "m³", status: 'available' },
    { name: "Ladrillos", quantity: 50, unit: "millares", status: 'low' },
    { name: "Arena", quantity: 25, unit: "m³", status: 'low' }
  ],
  weather: {
    today: "☀️ Despejado, 22°C",
    tomorrow: "☁️ Nublado, 18°C", 
    dayAfter: "🌧️ Lluvia ligera, 15°C"
  }
};

export const useWhatsAppBot = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { saveMessage, conversations } = useWhatsAppPersistence();
  const { 
    getTemplateByType, 
    processTemplateResponse, 
    generateMenuResponse, 
    generateFormResponse 
  } = useWhatsAppTemplates();

  const processMessage = useCallback(async (message: string, contactId: string): Promise<ChatMessage> => {
    setIsProcessing(true);
    
    try {
      // Find conversation for this contact
      const conversation = conversations?.find(c => c.contact_id === contactId);
      
      if (conversation) {
        // Save user message
        saveMessage({
          conversationId: conversation.id,
          senderType: 'user',
          messageText: message
        });
      }
      
      const response = await generateIntelligentResponse(message, contactId);
      
      if (conversation) {
        // Save bot response
        saveMessage({
          conversationId: conversation.id,
          senderType: 'bot',
          messageText: response.text,
          messageType: response.type,
          templateData: response.metadata
        });
      }
      
      // Simular guardado en base de datos si es necesario
      if (response.type === 'report' || response.type === 'alert') {
        await saveToDatabase(response, contactId);
      }
      
      return response;
    } finally {
      setIsProcessing(false);
    }
  }, [conversations, saveMessage]);

  const generateIntelligentResponse = async (userMessage: string, contactId: string): Promise<ChatMessage> => {
    const message = userMessage.toLowerCase();
    const timestamp = new Date();

    // Check if this is a menu selection or template response
    if (message.match(/^[1-4]$/)) {
      const menuTemplate = getTemplateByType('menu');
      if (menuTemplate) {
        const option = menuTemplate.content.options?.[parseInt(message) - 1];
        if (option) {
          switch (option.id) {
            case '1': // Reportar avance
              const progressTemplate = getTemplateByType('progress_form');
              if (progressTemplate) {
                return {
                  id: Date.now().toString(),
                  text: generateFormResponse(progressTemplate),
                  timestamp,
                  sender: 'bot',
                  type: 'template',
                  metadata: { templateId: progressTemplate.id, templateType: 'progress_form' }
                };
              }
              break;
            case '2': // Consultar inventario
              const materials = mockProjectData.materials;
              const lowStock = materials.filter(m => m.status === 'low');
              
              let responseText = "📦 **Inventario Actual**\n\n";
              
              materials.forEach(material => {
                const emoji = material.status === 'available' ? '✅' : material.status === 'low' ? '⚠️' : '❌';
                responseText += `${emoji} ${material.name}: ${material.quantity} ${material.unit}\n`;
              });
              
              if (lowStock.length > 0) {
                responseText += `\n⚠️ **Materiales con stock bajo:**\n`;
                lowStock.forEach(material => {
                  responseText += `• ${material.name}: ${material.quantity} ${material.unit}\n`;
                });
                responseText += `\n¿Deseas que genere una orden de compra?`;
              }
              
              return {
                id: Date.now().toString(),
                text: responseText,
                timestamp,
                sender: 'bot',
                type: 'inventory',
                metadata: { 
                  materials,
                  lowStock,
                  requiresAction: lowStock.length > 0
                }
              };
            case '3': // Reportar problema
              return {
                id: Date.now().toString(),
                text: `🚨 *Reporte de Problema*\n\n` +
                      `Por favor describe el problema incluyendo:\n` +
                      `• Ubicación específica\n` +
                      `• Tipo de problema\n` +
                      `• Nivel de urgencia (1-5)\n` +
                      `• Personal afectado\n\n` +
                      `Ejemplo: "Problema eléctrico en área 2, nivel 4, afecta a 3 trabajadores"`,
                timestamp,
                sender: 'bot',
                type: 'alert'
              };
            case '4': // Ver clima
              const weather = mockProjectData.weather;
              return {
                id: Date.now().toString(),
                text: "🌤️ **Pronóstico para los próximos 3 días**\n\n" +
                      `**Hoy:** ${weather.today}\n` +
                      `**Mañana:** ${weather.tomorrow}\n` +
                      `**Pasado mañana:** ${weather.dayAfter}\n\n` +
                      "⚠️ **Recomendaciones:**\n" +
                      "• Proteger materiales si hay lluvia\n" +
                      "• Revisar impermeabilización\n" +
                      "• Considerar horarios alternativos\n\n" +
                      "*¿Necesitas ajustar la programación de actividades?*",
                timestamp,
                sender: 'bot',
                type: 'weather'
              };
          }
        }
      }
    }

    // Handle structured progress data
    if (message.includes('actividad:') && message.includes('cantidad:')) {
      const templateResponse = processTemplateResponse('progress_form', userMessage);
      if (templateResponse) {
        return {
          id: Date.now().toString(),
          text: `✅ *Avance Registrado*\n\n` +
                `Gracias por reportar tu avance. La información ha sido guardada:\n\n` +
                `📝 **Datos registrados:**\n` +
                `${userMessage}\n\n` +
                `🎯 El progreso se actualizará en el sistema en breve.\n\n` +
                `¿Hay algo más que necesites reportar?`,
          timestamp,
          sender: 'bot',
          type: 'report',
          metadata: templateResponse
        };
      }
    }
    
    // Análisis avanzado del mensaje
    if (message.includes('avance') || message.includes('progreso') || message.includes('estado')) {
      const activities = mockProjectData.activities;
      const inProgress = activities.filter(a => a.status === 'in-progress');
      
      let responseText = "📊 **Estado Actual del Proyecto**\n\n";
      responseText += `🏗️ ${mockProjectData.projectName}\n\n`;
      
      inProgress.forEach(activity => {
        const emoji = activity.progress >= 80 ? '🟢' : activity.progress >= 50 ? '🟡' : '🔴';
        responseText += `${emoji} ${activity.name}: ${activity.progress}%\n`;
      });
      
      responseText += `\n💡 *Último reporte actualizado*\n`;
      responseText += `¿Necesitas detalles específicos de alguna actividad?`;
      
      return {
        id: Date.now().toString(),
        text: responseText,
        timestamp,
        sender: 'bot',
        type: 'report',
        metadata: { 
          activities: inProgress,
          reportType: 'progress_summary'
        }
      };
    }
    
    if (message.includes('problema') || message.includes('retraso') || message.includes('ayuda') || message.includes('help')) {
      const responseText = "🚨 **Sistema de Alertas Activado**\n\n" +
        "He registrado tu solicitud de ayuda. Un supervisor será notificado inmediatamente.\n\n" +
        "**¿Qué puedes hacer ahora?**\n" +
        "📸 Enviar fotos del problema\n" +
        "📍 Especificar ubicación exacta\n" +
        "⚡ Indicar nivel de urgencia (1-5)\n" +
        "⏰ Estimación de tiempo afectado\n\n" +
        "*Tiempo estimado de respuesta: 15 minutos*";
      
      return {
        id: Date.now().toString(),
        text: responseText,
        timestamp,
        sender: 'bot',
        type: 'alert',
        metadata: { 
          alertLevel: 'medium',
          contactId,
          requiresResponse: true
        }
      };
    }
    
    if (message.includes('materiales') || message.includes('inventario') || message.includes('stock')) {
      const materials = mockProjectData.materials;
      const lowStock = materials.filter(m => m.status === 'low');
      
      let responseText = "📦 **Inventario Actual**\n\n";
      
      materials.forEach(material => {
        const emoji = material.status === 'available' ? '✅' : material.status === 'low' ? '⚠️' : '❌';
        responseText += `${emoji} ${material.name}: ${material.quantity} ${material.unit}\n`;
      });
      
      if (lowStock.length > 0) {
        responseText += `\n⚠️ **Materiales con stock bajo:**\n`;
        lowStock.forEach(material => {
          responseText += `• ${material.name}: ${material.quantity} ${material.unit}\n`;
        });
        responseText += `\n¿Deseas que genere una orden de compra?`;
      }
      
      return {
        id: Date.now().toString(),
        text: responseText,
        timestamp,
        sender: 'bot',
        type: 'inventory',
        metadata: { 
          materials,
          lowStock,
          requiresAction: lowStock.length > 0
        }
      };
    }
    
    if (message.includes('clima') || message.includes('tiempo') || message.includes('lluvia')) {
      const weather = mockProjectData.weather;
      const responseText = "🌤️ **Pronóstico para los próximos 3 días**\n\n" +
        `**Hoy:** ${weather.today}\n` +
        `**Mañana:** ${weather.tomorrow}\n` +
        `**Pasado mañana:** ${weather.dayAfter}\n\n` +
        "⚠️ **Recomendaciones:**\n" +
        "• Proteger materiales el jueves\n" +
        "• Revisar impermeabilización\n" +
        "• Considerar horarios alternativos\n\n" +
        "*¿Necesitas ajustar la programación de actividades?*";
      
      return {
        id: Date.now().toString(),
        text: responseText,
        timestamp,
        sender: 'bot',
        type: 'weather',
        metadata: { 
          weather,
          hasWeatherAlert: true,
          suggestedActions: ['protect_materials', 'review_schedule']
        }
      };
    }
    
    if (message.includes('ubicacion') || message.includes('donde') || message.includes('dirección')) {
      const responseText = "📍 **Ubicación del Proyecto**\n\n" +
        `🏗️ ${mockProjectData.projectName}\n` +
        "📍 Av. Las Condes 1234, Santiago\n" +
        "🚗 Sector: Las Condes, RM\n\n" +
        "**Sectores del proyecto:**\n" +
        "• Torre A: Fundaciones\n" +
        "• Torre B: Estructura\n" +
        "• Estacionamientos: Excavación\n\n" +
        "*¿Necesitas direcciones específicas a algún sector?*";
      
      return {
        id: Date.now().toString(),
        text: responseText,
        timestamp,
        sender: 'bot',
        type: 'location',
        metadata: { 
          coordinates: { lat: -33.4569, lng: -70.6483 },
          projectSectors: ['Torre A', 'Torre B', 'Estacionamientos'],
          address: 'Av. Las Condes 1234, Santiago'
        }
      };
    }
    
    // Respuesta por defecto con menú de opciones desde template
    const menuTemplate = getTemplateByType('menu');
    if (menuTemplate) {
      return {
        id: Date.now().toString(),
        text: generateMenuResponse(menuTemplate),
        timestamp,
        sender: 'bot',
        type: 'text',
        metadata: { templateId: menuTemplate.id }
      };
    }

    // Fallback if no template found
    const responseText = "🤖 **Asistente FieldProgress**\n\n" +
      "Hola! Soy tu asistente inteligente para gestión de obras.\n\n" +
      "**¿En qué puedo ayudarte?**\n" +
      "📊 Consultar avance de obra\n" +
      "🚨 Reportar problemas o solicitar ayuda\n" +
      "📦 Verificar inventarios y materiales\n" +
      "🌤️ Información del clima\n\n" +
      "*Escribe tu consulta o usa palabras clave como 'avance', 'materiales', 'problema', etc.*";
    
    return {
      id: Date.now().toString(),
      text: responseText,
      timestamp,
      sender: 'bot',
      type: 'text',
      metadata: { 
        isWelcome: true,
        availableCommands: ['avance', 'materiales', 'problema', 'clima']
      }
    };
  };

  const saveToDatabase = async (message: ChatMessage, contactId: string) => {
    try {
      // Simular guardado en base de datos
      if (message.type === 'report') {
        // Actualizar progreso en la base de datos
        console.log('Saving progress report to database:', message.metadata);
        
        toast({
          title: "Reporte actualizado",
          description: "El avance ha sido registrado en el sistema",
        });
      }
      
      if (message.type === 'alert') {
        // Crear alerta en el sistema
        console.log('Creating alert in database:', message.metadata);
        
        toast({
          title: "Alerta creada",
          description: "El supervisor ha sido notificado",
        });
      }
      
      // Aquí se podría guardar en las tablas reales:
      // - daily_reports
      // - progress_entries  
      // - audit_logs
      
    } catch (error) {
      console.error('Error saving to database:', error);
    }
  };

  return {
    processMessage,
    isProcessing,
    mockProjectData
  };
};