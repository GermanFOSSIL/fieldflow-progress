import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TemplateEditor } from "@/components/whatsapp/TemplateEditor";
import { TemplatePreview } from "@/components/whatsapp/TemplatePreview";
import { ProjectSelector } from "@/components/whatsapp/ProjectSelector";
import { useWhatsAppTemplates } from "@/hooks/useWhatsAppTemplates";
import { useWhatsAppTemplateEditor } from "@/hooks/useWhatsAppTemplateEditor";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Search, 
  MessageSquare,
  FileText,
  AlertCircle,
  ClipboardList
} from "lucide-react";
import { toast } from "sonner";

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
  created_at?: string;
  updated_at?: string;
}

export default function WhatsAppTemplateAdmin() {
  const { templates, isLoading } = useWhatsAppTemplates();
  const { createTemplate, updateTemplate, deleteTemplate, duplicateTemplate } = useWhatsAppTemplateEditor();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const filteredTemplates = templates?.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.template_type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'menu': return <MessageSquare className="h-4 w-4" />;
      case 'survey': return <ClipboardList className="h-4 w-4" />;
      case 'progress_form': return <FileText className="h-4 w-4" />;
      case 'alert_form': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'menu': return 'default';
      case 'survey': return 'secondary';
      case 'progress_form': return 'destructive';
      case 'alert_form': return 'outline';
      default: return 'default';
    }
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setIsEditorOpen(true);
  };

  const handleEditTemplate = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };

  const handlePreviewTemplate = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleDuplicateTemplate = async (template: WhatsAppTemplate) => {
    try {
      await duplicateTemplate(template.id);
      toast.success(`Template "${template.name}" duplicado exitosamente`);
    } catch (error) {
      toast.error('Error al duplicar template');
    }
  };

  const handleDeleteTemplate = async (template: WhatsAppTemplate) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${template.name}"?`)) {
      try {
        await deleteTemplate(template.id);
        toast.success(`Template "${template.name}" eliminado exitosamente`);
      } catch (error) {
        toast.error('Error al eliminar template');
      }
    }
  };

  const handleSaveTemplate = async (templateData: Partial<WhatsAppTemplate>) => {
    try {
      if (selectedTemplate) {
        await updateTemplate(selectedTemplate.id, templateData);
        toast.success('Template actualizado exitosamente');
      } else {
        await createTemplate(templateData as Omit<WhatsAppTemplate, 'id'>);
        toast.success('Template creado exitosamente');
      }
      setIsEditorOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      toast.error(selectedTemplate ? 'Error al actualizar template' : 'Error al crear template');
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Selector */}
      <div className="mb-6">
        <ProjectSelector />
      </div>
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates WhatsApp</h1>
          <p className="text-muted-foreground">
            Administra plantillas interactivas para automatizar conversaciones
          </p>
        </div>
        <Button onClick={handleNewTemplate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Template
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-3">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar templates por nombre o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {templates?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Templates Activos
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(template.template_type)}
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <Badge variant={getTypeBadgeVariant(template.template_type)}>
                    {template.template_type}
                  </Badge>
                </div>
                <CardDescription>
                  {template.content.title}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-2">
                <div className="space-y-3">
                  {/* Template Content Summary */}
                  <div className="text-sm text-muted-foreground">
                    {template.template_type === 'menu' && (
                      <span>{template.content.options?.length || 0} opciones</span>
                    )}
                    {template.template_type === 'progress_form' && (
                      <span>{template.content.fields?.length || 0} campos</span>
                    )}
                    {template.template_type === 'survey' && (
                      <span>{template.content.fields?.length || 0} preguntas</span>
                    )}
                    {template.template_type === 'alert_form' && (
                      <span>{template.content.fields?.length || 0} campos</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePreviewTemplate(template)}
                      className="flex-1"
                    >
                      Vista Previa
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteTemplate(template)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay templates</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No se encontraron templates que coincidan con tu búsqueda' : 'Crea tu primer template para comenzar'}
              </p>
              <Button onClick={handleNewTemplate} className="gap-2">
                <Plus className="h-4 w-4" />
                Crear Template
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Template Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Editar Template' : 'Nuevo Template'}
            </DialogTitle>
          </DialogHeader>
          <TemplateEditor
            template={selectedTemplate}
            onSave={handleSaveTemplate}
            onCancel={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vista Previa</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <TemplatePreview template={selectedTemplate} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}