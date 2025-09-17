import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, MessageSquare, FileText, AlertCircle, ClipboardList } from "lucide-react";

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

interface TemplatePreviewProps {
  template?: WhatsAppTemplate;
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'menu': return <MessageSquare className="h-4 w-4" />;
      case 'survey': return <ClipboardList className="h-4 w-4" />;
      case 'progress_form': return <FileText className="h-4 w-4" />;
      case 'alert_form': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'menu': return 'Menú Interactivo';
      case 'survey': return 'Encuesta';
      case 'progress_form': return 'Formulario de Avance';
      case 'alert_form': return 'Formulario de Alerta';
      default: return 'Template';
    }
  };

  const generateBotMessage = () => {
    if (!template?.content) {
      return (
        <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
          <Bot className="h-5 w-5 text-blue-500" />
          <span className="text-gray-600">Configura el template para ver la vista previa</span>
        </div>
      );
    }

    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="bg-gray-100 rounded-lg p-4 max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {getTypeIcon(template.template_type)}
                {getTypeLabel(template.template_type)}
              </Badge>
            </div>
            <div className="text-sm">
              <p className="font-semibold mb-2">*{template.content.title}*</p>
              
              {template.template_type === 'menu' && template.content.options && (
                <div className="space-y-1">
                  {template.content.options.map((option, index) => (
                    <p key={option.id} className="text-gray-700">
                      {index + 1}. {option.text || `Opción ${index + 1}`}
                    </p>
                  ))}
                  <p className="text-xs text-gray-500 mt-2 italic">
                    Responde con el número de tu opción.
                  </p>
                </div>
              )}

              {template.template_type === 'progress_form' && (
                <div className="space-y-2">
                  <p className="text-gray-700">
                    Por favor proporciona la siguiente información:
                  </p>
                  <div className="space-y-1 text-xs">
                    <p>• Proyecto</p>
                    <p>• Área</p>
                    <p>• Solicitante</p>
                    <p>• Actividades</p>
                    <p>• Fotos</p>
                    <p>• Fecha</p>
                  </div>
                  <div className="mt-2 p-2 bg-gray-200 rounded text-xs font-mono">
                    proyecto: [tu respuesta]<br/>
                    area: [tu respuesta]<br/>
                    solicitante: [tu respuesta]<br/>
                    actividades: [tu respuesta]<br/>
                    fotos: [tu respuesta]<br/>
                    fecha: [tu respuesta]
                  </div>
                </div>
              )}

              {template.template_type === 'survey' && (
                <div className="space-y-2">
                  <p className="text-gray-700">
                    Por favor responde las siguientes preguntas:
                  </p>
                  <div className="space-y-1 text-xs">
                    <p>• ¿Cómo calificarías el servicio?</p>
                    <p>• ¿Recomendarías nuestro servicio?</p>
                    <p>• Comentarios adicionales</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    Responde cada pregunta en una línea separada.
                  </p>
                </div>
              )}

              {template.template_type === 'alert_form' && (
                <div className="space-y-2">
                  <p className="text-gray-700">
                    🚨 Formulario de Alerta
                  </p>
                  <div className="space-y-1 text-xs">
                    <p>• Tipo de alerta</p>
                    <p>• Descripción</p>
                    <p>• Ubicación</p>
                    <p>• Prioridad</p>
                    <p>• Contacto de emergencia</p>
                  </div>
                  <p className="text-xs text-red-500 mt-2 italic">
                    ⚠️ Este es un formulario de emergencia
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            09:27 a. m.
          </div>
        </div>
      </div>
    );
  };

  const generateUserResponse = () => {
    if (!template?.content) return null;

    return (
      <div className="flex items-start gap-3 justify-end">
        <div className="flex-1 max-w-xs">
          <div className="bg-blue-500 text-white rounded-lg p-3 ml-auto">
            <div className="text-sm">
              {template.template_type === 'menu' && (
                <p>1</p>
              )}
              {template.template_type === 'progress_form' && (
                <div className="space-y-1 text-xs">
                  <p>proyecto: Demo Project</p>
                  <p>area: Área A</p>
                  <p>solicitante: Juan Pérez</p>
                  <p>actividades: Fundaciones - 15 m³</p>
                  <p>fotos: [adjuntas]</p>
                  <p>fecha: 2025-01-XX</p>
                </div>
              )}
              {template.template_type === 'survey' && (
                <div className="space-y-1 text-xs">
                  <p>1. Excelente (5/5)</p>
                  <p>2. Sí, definitivamente</p>
                  <p>3. Muy buen servicio</p>
                </div>
              )}
              {template.template_type === 'alert_form' && (
                <div className="space-y-1 text-xs">
                  <p>tipo: Seguridad</p>
                  <p>descripcion: Accidente menor</p>
                  <p>ubicacion: Zona norte</p>
                  <p>prioridad: Media</p>
                  <p>contacto: Supervisor</p>
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-right">
            09:27 a. m.
          </div>
        </div>
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-gray-600" />
        </div>
      </div>
    );
  };

  const generateBotConfirmation = () => {
    if (!template?.content) return null;

    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-sm text-gray-700">
                Respuesta recibida correctamente. ¡Gracias!
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            09:27 a. m.
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Vista Previa del Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto pr-4 pb-4 min-h-0">
            <div className="space-y-4">
              {generateBotMessage()}
              {generateUserResponse()}
              {generateBotConfirmation()}
            </div>
          </div>
          
          {template?.content && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  {getTypeIcon(template.template_type)}
                  {getTypeLabel(template.template_type)}
                </Badge>
                <Badge variant="secondary">
                  {template.name || 'Template sin nombre'}
                </Badge>
              </div>
              <p className="text-xs text-blue-700">
                Este template está configurado para funcionar con el bot de WhatsApp Business.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}