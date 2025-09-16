import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
      options: [],
      fields: []
    },
    is_active: true
  });

  useEffect(() => {
    if (template) {
      setFormData({
        ...template
      });
    } else {
      setFormData({
        name: '',
        template_type: 'menu',
        content: {
          title: '',
          options: [{ id: '1', text: '' }],
          fields: []
        },
        is_active: true
      });
    }
  }, [template]);

  const handleBasicInfoChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContentChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content!,
        [field]: value
      }
    }));
  };

  const handleTypeChange = (newType: 'menu' | 'survey' | 'progress_form' | 'alert_form') => {
    setFormData(prev => ({
      ...prev,
      template_type: newType,
      content: {
        ...prev.content!,
        options: newType === 'menu' ? [{ id: '1', text: '' }] : [],
        fields: newType !== 'menu' ? [{ name: '', type: 'text', label: '' }] : []
      }
    }));
  };

  // Menu Options Management
  const addOption = () => {
    const newId = (formData.content?.options?.length || 0) + 1;
    handleContentChange('options', [
      ...(formData.content?.options || []),
      { id: newId.toString(), text: '' }
    ]);
  };

  const removeOption = (index: number) => {
    const options = [...(formData.content?.options || [])];
    options.splice(index, 1);
    handleContentChange('options', options);
  };

  const updateOption = (index: number, field: 'id' | 'text', value: string) => {
    const options = [...(formData.content?.options || [])];
    options[index] = { ...options[index], [field]: value };
    handleContentChange('options', options);
  };

  // Form Fields Management
  const addField = () => {
    handleContentChange('fields', [
      ...(formData.content?.fields || []),
      { name: '', type: 'text', label: '' }
    ]);
  };

  const removeField = (index: number) => {
    const fields = [...(formData.content?.fields || [])];
    fields.splice(index, 1);
    handleContentChange('fields', fields);
  };

  const updateField = (index: number, field: string, value: any) => {
    const fields = [...(formData.content?.fields || [])];
    fields[index] = { ...fields[index], [field]: value };
    handleContentChange('fields', fields);
  };

  const addFieldOption = (fieldIndex: number) => {
    const fields = [...(formData.content?.fields || [])];
    fields[fieldIndex] = {
      ...fields[fieldIndex],
      options: [...(fields[fieldIndex].options || []), '']
    };
    handleContentChange('fields', fields);
  };

  const updateFieldOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const fields = [...(formData.content?.fields || [])];
    const options = [...(fields[fieldIndex].options || [])];
    options[optionIndex] = value;
    fields[fieldIndex] = { ...fields[fieldIndex], options };
    handleContentChange('fields', fields);
  };

  const removeFieldOption = (fieldIndex: number, optionIndex: number) => {
    const fields = [...(formData.content?.fields || [])];
    const options = [...(fields[fieldIndex].options || [])];
    options.splice(optionIndex, 1);
    fields[fieldIndex] = { ...fields[fieldIndex], options };
    handleContentChange('fields', fields);
  };

  const handleSave = () => {
    if (!formData.name || !formData.content?.title) {
      alert('Por favor completa los campos obligatorios');
      return;
    }
    onSave(formData);
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
    <div className="h-[80vh] flex flex-col">
      <Tabs defaultValue="editor" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-6 pr-4">
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
                  <CardContent className="space-y-4">
                    {formData.content?.options?.map((option, index) => (
                      <div key={index} className="flex gap-2 items-center p-3 border rounded-lg">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline">{index + 1}</Badge>
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
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Form Fields */}
              {formData.template_type !== 'menu' && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Campos del Formulario</CardTitle>
                      <Button onClick={addField} size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Agregar Campo
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.content?.fields?.map((field, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">Campo {index + 1}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeField(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Nombre del Campo</Label>
                            <Input
                              value={field.name}
                              onChange={(e) => updateField(index, 'name', e.target.value)}
                              placeholder="nombre_campo"
                            />
                          </div>
                          <div>
                            <Label>Etiqueta</Label>
                            <Input
                              value={field.label || ''}
                              onChange={(e) => updateField(index, 'label', e.target.value)}
                              placeholder="Etiqueta visible"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Tipo de Campo</Label>
                          <Select 
                            value={field.type} 
                            onValueChange={(value) => updateField(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Texto</SelectItem>
                              <SelectItem value="number">Número</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="date">Fecha</SelectItem>
                              <SelectItem value="select">Selección</SelectItem>
                              <SelectItem value="textarea">Área de Texto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {field.type === 'select' && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label>Opciones</Label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addFieldOption(index)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {field.options?.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex gap-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => updateFieldOption(index, optionIndex, e.target.value)}
                                    placeholder="Opción"
                                    className="flex-1"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeFieldOption(index, optionIndex)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="preview" className="flex-1">
          <div className="flex justify-center">
            <TemplatePreview template={formData as WhatsAppTemplate} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          {template ? 'Actualizar' : 'Crear'} Template
        </Button>
      </div>
    </div>
  );
}