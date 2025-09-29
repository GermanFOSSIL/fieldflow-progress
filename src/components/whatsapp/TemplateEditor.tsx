import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplatePreview } from "./TemplatePreview";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  X,
  MessageSquare,
  FileText,
  AlertCircle,
  ClipboardList
} from "lucide-react";

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

interface TemplateEditorProps {
  template?: WhatsAppTemplate | null;
  onSave: (template: Partial<WhatsAppTemplate>) => void;
  onCancel: () => void;
}

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [formData, setFormData] = useState<Partial<WhatsAppTemplate>>({
    name: '',
    template_type: 'menu',
    content: {
      title: '',
      options: [{ id: '1', text: '' }],
      fields: []
    },
    is_active: true
  });

  useEffect(() => {
    if (template) {
      setFormData({
        ...template,
        content: {
          title: template.content?.title || '',
          options: template.content?.options || [{ id: '1', text: '' }],
          fields: template.content?.fields || []
        }
      });
    }
  }, [template]);

  const handleBasicInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContentChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }));
  };

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      template_type: type as any,
      content: {
        ...prev.content,
        options: type === 'menu' ? [{ id: '1', text: '' }] : [],
        fields: type !== 'menu' ? [] : prev.content?.fields
      }
    }));
  };

  const addOption = () => {
    if (formData.content?.options) {
      const newId = String(formData.content.options.length + 1);
      setFormData(prev => ({
        ...prev,
        content: {
          ...prev.content,
          options: [
            ...prev.content?.options || [],
            { id: newId, text: '' }
          ]
        }
      }));
    }
  };

  const updateOption = (index: number, field: string, value: string) => {
    if (formData.content?.options) {
      const updatedOptions = [...formData.content.options];
      updatedOptions[index] = { ...updatedOptions[index], [field]: value };
      setFormData(prev => ({
        ...prev,
        content: {
          ...prev.content,
          options: updatedOptions
        }
      }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.content?.options && formData.content.options.length > 1) {
      const updatedOptions = formData.content.options.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        content: {
          ...prev.content,
          options: updatedOptions
        }
      }));
    }
  };

  const handleSave = () => {
    if (formData.name && formData.content?.title) {
      onSave(formData);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'menu': return <MessageSquare className="h-4 w-4" />;
      case 'survey': return <ClipboardList className="h-4 w-4" />;
      case 'progress_form': return <FileText className="h-4 w-4" />;
      case 'alert_form': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl max-h-[90vh] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg">
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
            <h2 className="text-xl font-semibold">
              {template ? 'Editar Template' : 'Nuevo Template'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="editor" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mx-6 mt-4 flex-shrink-0">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Vista Previa</TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="flex-1 mx-6 mt-4">
              <div className="h-full overflow-y-auto pr-2 pb-6">
                <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre del Template *</Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                      placeholder="Ej: Menú Principal, Reporte de Avance"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Tipo de Template *</Label>
                    <Select value={formData.template_type} onValueChange={handleTypeChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="menu">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Menú Interactivo
                          </div>
                        </SelectItem>
                        <SelectItem value="progress_form">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Formulario de Avance
                          </div>
                        </SelectItem>
                        <SelectItem value="survey">
                          <div className="flex items-center gap-2">
                            <ClipboardList className="h-4 w-4" />
                            Encuesta
                          </div>
                        </SelectItem>
                        <SelectItem value="alert_form">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Formulario de Alerta
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="title">Título del Mensaje *</Label>
                    <Input
                      id="title"
                      value={formData.content?.title || ''}
                      onChange={(e) => handleContentChange('title', e.target.value)}
                      placeholder="Ej: ¿En qué puedo ayudarte hoy?"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Menu Options */}
              {formData.template_type === 'menu' && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Opciones del Menú</CardTitle>
                      <Button onClick={addOption} size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Agregar Opción
                      </Button>
                    </div>
                  </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-56 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {formData.content?.options?.map((option, index) => (
                            <div key={option.id} className="flex gap-2 items-center p-3 border rounded-lg bg-gray-50">
                              <GripVertical className="h-4 w-4 text-gray-400" />
                              <Badge variant="outline" className="min-w-[30px] text-center">
                                {index + 1}
                              </Badge>
                        <Input
                          value={option.text}
                          onChange={(e) => updateOption(index, 'text', e.target.value)}
                          placeholder="Texto de la opción"
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                          disabled={formData.content?.options?.length === 1}
                                className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                        </div>
                  </CardContent>
                </Card>
              )}

                  {/* Form Fields for other types */}
              {formData.template_type !== 'menu' && (
                <Card>
                  <CardHeader>
                      <CardTitle>Campos del Formulario</CardTitle>
                  </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">
                          Los campos del formulario se configurarán automáticamente según el tipo seleccionado.
                        </p>
                  </CardContent>
                </Card>
                  )}
                </div>
              </div>
            </TabsContent>
        
            <TabsContent value="preview" className="flex-1 mx-6 mt-4">
              <div className="h-full overflow-y-auto pr-2">
                <TemplatePreview template={formData as WhatsAppTemplate} />
              </div>
            </TabsContent>
      </Tabs>
        </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50 flex-shrink-0 mt-auto">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Guardar Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}