import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, User } from "lucide-react";

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
  template: WhatsAppTemplate;
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  const generatePreviewText = () => {
    if (!template.content) return '';

    let text = `*${template.content.title}*\n\n`;

    switch (template.template_type) {
      case 'menu':
        template.content.options?.forEach((option, index) => {
          text += `${index + 1}. ${option.text}\n`;
        });
        text += '\nResponde con el número de tu opción.';
        break;

      case 'progress_form':
        text += 'Por favor proporciona la siguiente información:\n\n';
        template.content.fields?.forEach((field, index) => {
          text += `${index + 1}. ${field.label || field.name}`;
          if (field.type === 'select' && field.options) {
            text += ` (${field.options.join(', ')})`;
          }
          text += '\n';
        });
        text += '\nPuedes responder en formato:\n```\n';
        template.content.fields?.forEach(field => {
          text += `${field.name}: [tu respuesta]\n`;
        });
        text += '```';
        break;

      case 'survey':
        text += 'Encuesta:\n\n';
        template.content.fields?.forEach((field, index) => {
          text += `${index + 1}. ${field.label || field.name}\n`;
          if (field.type === 'select' && field.options) {
            field.options.forEach((option, optIndex) => {
              text += `   ${String.fromCharCode(97 + optIndex)}. ${option}\n`;
            });
          }
          text += '\n';
        });
        break;

      case 'alert_form':
        text += 'Formulario de Alerta:\n\n';
        template.content.fields?.forEach((field, index) => {
          text += `${index + 1}. ${field.label || field.name}`;
          if (field.type === 'select' && field.options) {
            text += ` (${field.options.join(', ')})`;
          }
          text += '\n';
        });
        break;
    }

    return text;
  };

  const previewText = generatePreviewText();

  return (
    <div className="max-w-sm mx-auto">
      {/* WhatsApp-like header */}
      <div className="bg-primary text-primary-foreground p-3 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">FieldProgress Bot</div>
            <div className="text-xs opacity-80">en línea</div>
          </div>
        </div>
      </div>

      {/* Message preview */}
      <div className="bg-muted/30 p-4 min-h-[200px] rounded-b-lg">
        <div className="space-y-3">
          {/* Template info */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs">
              {template.template_type}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {template.name}
            </span>
          </div>

          {/* Bot message bubble */}
          <div className="flex justify-start">
            <div className="bg-muted max-w-[80%] rounded-lg px-3 py-2">
              <div className="text-sm whitespace-pre-line">
                {previewText}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date().toLocaleTimeString('es-CL', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>

          {/* Sample user response */}
          <div className="flex justify-end">
            <div className="bg-primary text-primary-foreground max-w-[80%] rounded-lg px-3 py-2">
              <div className="text-sm">
                {template.template_type === 'menu' ? (
                  "1"
                ) : template.template_type === 'progress_form' ? (
                  "actividad: Fundaciones\ncantidad: 15\nunidad: m³"
                ) : template.template_type === 'survey' ? (
                  "a"
                ) : (
                  "Problema con equipos en área 2"
                )}
              </div>
              <div className="text-xs opacity-80 mt-1">
                {new Date().toLocaleTimeString('es-CL', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>

          {/* Bot confirmation */}
          <div className="flex justify-start">
            <div className="bg-muted max-w-[80%] rounded-lg px-3 py-2">
              <div className="text-sm">
                ✅ Respuesta recibida correctamente. Gracias!
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date().toLocaleTimeString('es-CL', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground mt-2">
        Vista previa del template
      </div>
    </div>
  );
}