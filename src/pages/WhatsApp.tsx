import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, 
  Send, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon,
  MapPin,
  Users,
  TrendingUp,
  Download,
  Plus,
  FileCode,
  Eye,
  MessageCircleCode,
  UserPlus,
  Settings
} from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { useWhatsAppPersistence } from "@/hooks/useWhatsAppPersistence";
import { useWhatsAppTemplates } from "@/hooks/useWhatsAppTemplates";
import { useWhatsAppTemplateEditor } from "@/hooks/useWhatsAppTemplateEditor";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'report' | 'location' | 'template';
  status: 'sent' | 'delivered' | 'read';
  attachments?: string[];
  reportData?: {
    activity: string;
    progress: number;
    location: string;
  };
  templateData?: {
    templateName: string;
    templateType: string;
  };
}

export default function WhatsApp() {
  const { selectedProject } = useProject();
  const { toast } = useToast();
  
  // WhatsApp persistence hooks
  const { 
    contacts, 
    conversations, 
    contactsLoading,
    saveMessage,
    createConversation,
    fetchMessages,
    exportConversation
  } = useWhatsAppPersistence();
  
  // Templates hooks
  const { templates, isLoading: isLoadingTemplates } = useWhatsAppTemplates();
  const { generateMenuResponse, generateFormResponse } = useWhatsAppTemplates();
  
  // Local state
  const [activeTab, setActiveTab] = useState("conversations");
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [customTemplateData, setCustomTemplateData] = useState<any>({});

  const mockMessages: Message[] = [
    {
      id: "1",
      sender: "Juan Pérez",
      text: "Buenos días, reporte de avance del día:",
      timestamp: "2024-03-15 08:30",
      type: 'text',
      status: 'read'
    },
    {
      id: "2", 
      sender: "Juan Pérez",
      text: "Actividad: Construcción muro norte - Avance: 75% - Ubicación: Sector A",
      timestamp: "2024-03-15 08:32",
      type: 'report',
      status: 'read',
      reportData: {
        activity: "Construcción muro norte",
        progress: 75,
        location: "Sector A"
      }
    },
    {
      id: "3",
      sender: "system",
      text: "Perfecto Juan! Tu reporte ha sido registrado. ¿Necesitas algún material adicional?",
      timestamp: "2024-03-15 08:35",
      type: 'text',
      status: 'delivered'
    }
  ];

  // Initialize messages with mock data on first render
  useEffect(() => {
    if (messages.length === 0) {
      setMessages(mockMessages);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: "system",
      text: newMessage,
      timestamp: new Date().toLocaleTimeString(),
      type: 'text',
      status: 'sent'
    };

    try {
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Save to database
      await saveMessage({
        conversationId: selectedContact.conversation_id || `conv_${selectedContact.id}`,
        senderType: 'bot',
        messageText: newMessage,
        messageType: 'text'
      });
      
      toast({
        title: "Mensaje enviado",
        description: `Mensaje enviado a ${selectedContact.name}`,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive"
      });
    }
  };

  const handleSendTemplate = async (templateId: string, customData?: any) => {
    if (!selectedContact && selectedContacts.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos un contacto",
        variant: "destructive"
      });
      return;
    }

    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const recipients = selectedContact ? [selectedContact] : 
      contacts.filter(c => selectedContacts.includes(c.id));

    for (const contact of recipients) {
      let messageText = "";
      
      switch (template.template_type) {
        case 'menu':
          messageText = generateMenuResponse(template);
          break;
        case 'progress_form':
          messageText = generateFormResponse(template);
          break;
        default:
          messageText = template.content?.title || `Plantilla: ${template.name}`;
      }

      const message: Message = {
        id: Date.now().toString() + contact.id,
        sender: "system",
        text: messageText,
        timestamp: new Date().toLocaleTimeString(),
        type: 'template',
        status: 'sent',
        templateData: {
          templateName: template.name,
          templateType: template.template_type
        }
      };

      try {
        if (selectedContact && selectedContact.id === contact.id) {
          setMessages(prev => [...prev, message]);
        }

        await saveMessage({
          conversationId: contact.conversation_id || `conv_${contact.id}`,
          senderType: 'bot',
          messageText: messageText,
          messageType: 'template'
        });
      } catch (error) {
        console.error('Error sending template:', error);
      }
    }

    toast({
      title: "Plantillas enviadas",
      description: `Plantilla "${template.name}" enviada a ${recipients.length} contacto(s)`,
    });

    setIsTemplateDialogOpen(false);
    setSelectedTemplate(null);
    setCustomTemplateData({});
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const msgs = await fetchMessages(conversationId);
      const formattedMessages: Message[] = msgs.map(msg => ({
        id: msg.id,
        sender: msg.sender_type === 'user' ? 'user' : 'system',
        text: msg.message_text || '',
        timestamp: new Date(msg.created_at).toLocaleTimeString(),
        type: (msg.message_type as any) || 'text',
        status: 'delivered'
      }));
      setMessages(formattedMessages.length > 0 ? formattedMessages : mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages(mockMessages);
    }
  };

  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact);
    if (contact.conversation_id) {
      loadMessages(contact.conversation_id);
    } else {
      setMessages(mockMessages);
    }
  };

  const handleContactCheckbox = (contactId: string, checked: boolean) => {
    setSelectedContacts(prev => {
      if (checked) {
        return [...prev, contactId];
      } else {
        return prev.filter(id => id !== contactId);
      }
    });
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isSystem = message.sender === 'system';
    
    return (
      <div className={`flex ${isSystem ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[70%] ${isSystem ? 'order-1' : 'order-2'}`}>
          <div
            className={`
              px-4 py-3 rounded-2xl shadow-sm
              ${isSystem 
                ? 'bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white ml-4' 
                : 'bg-card border border-border text-foreground mr-4'
              }
            `}
          >
            {message.type === 'report' && message.reportData ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">{message.text}</p>
                <div className="bg-white/20 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">{message.reportData.activity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">{message.reportData.progress}% completado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{message.reportData.location}</span>
                  </div>
                </div>
              </div>
            ) : message.type === 'template' && message.templateData ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageCircleCode className="w-4 h-4" />
                  <span className="text-xs font-medium opacity-75">
                    Plantilla: {message.templateData.templateName}
                  </span>
                </div>
                <p className="text-sm">{message.text}</p>
              </div>
            ) : (
              <p className="text-sm">{message.text}</p>
            )}
          </div>
          
          <div className={`flex items-center gap-2 mt-1 px-2 ${isSystem ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-muted-foreground">{message.timestamp}</span>
            {isSystem && (
              <div className="flex items-center gap-1">
                {message.status === 'sent' && <CheckCircle2 className="w-3 h-3 text-muted-foreground" />}
                {message.status === 'delivered' && <CheckCircle2 className="w-3 h-3 text-[#25D366]" />}
                {message.status === 'read' && <CheckCircle2 className="w-3 h-3 text-blue-500" />}
              </div>
            )}
          </div>
        </div>
        
        {!isSystem && (
          <Avatar className="w-8 h-8 order-1">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
              {message.sender.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  const TemplateSelectionDialog = () => (
    <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircleCode className="w-5 h-5" />
            Seleccionar Plantilla
          </DialogTitle>
          <DialogDescription>
            Elige una plantilla para enviar a los contactos seleccionados
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-auto">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className={`p-4 cursor-pointer transition-all hover:shadow-md border-2 ${
                selectedTemplate?.id === template.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {template.template_type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {template.content?.title || 'Sin descripción'}
                </p>
              </div>
            </Card>
          ))}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsTemplateDialogOpen(false);
              setSelectedTemplate(null);
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => selectedTemplate && handleSendTemplate(selectedTemplate.id)}
            disabled={!selectedTemplate}
            className="bg-[#25D366] hover:bg-[#128C7E] text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar Plantilla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const ContactsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-foreground">Gestión de Contactos</h3>
          {selectedContacts.length > 0 && (
            <Badge variant="secondary" className="bg-[#25D366]/10 text-[#25D366]">
              {selectedContacts.length} seleccionados
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {selectedContacts.length > 0 && (
            <Button 
              onClick={() => setIsTemplateDialogOpen(true)}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white"
            >
              <MessageCircleCode className="w-4 h-4 mr-2" />
              Enviar Plantilla
            </Button>
          )}
          <Button variant="outline" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Nuevo Contacto
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((contact) => (
          <Card key={contact.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedContacts.includes(contact.id)}
                  onCheckedChange={(checked) => 
                    handleContactCheckbox(contact.id, checked as boolean)
                  }
                />
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {contact.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'N/A'}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {contact.name || 'Sin nombre'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {contact.phone || 'Sin teléfono'}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      contact.role === 'supervisor' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      contact.role === 'worker' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {contact.role || 'Sin rol'}
                  </Badge>
                <div className={`w-2 h-2 rounded-full ${
                  contact.is_active ? 'bg-[#25D366]' : 'bg-gray-400'
                }`} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {contacts.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No hay contactos</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Agrega contactos para comenzar a enviar mensajes
          </p>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Agregar Primer Contacto
          </Button>
        </div>
      )}
    </div>
  );

  const TemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Plantillas WhatsApp</h3>
          <p className="text-sm text-muted-foreground">
            Administra y utiliza plantillas predefinidas para comunicación
          </p>
        </div>
        <Button asChild>
          <a href="/whatsapp-templates">
            <Settings className="w-4 h-4 mr-2" />
            Administrar Plantillas
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="p-4 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">{template.name}</h4>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    template.template_type === 'menu' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    template.template_type === 'progress_form' ? 'bg-green-50 text-green-700 border-green-200' :
                    'bg-purple-50 text-purple-700 border-purple-200'
                  }`}
                >
                  {template.template_type}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {template.content?.title || 'Sin descripción disponible'}
              </p>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedTemplate(template);
                    // Show preview or detailed view
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Vista previa
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setIsTemplateDialogOpen(true);
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Usar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <MessageCircleCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No hay plantillas</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Crea plantillas para agilizar la comunicación con tu equipo
          </p>
          <Button asChild>
            <a href="/whatsapp-templates">
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Plantilla
            </a>
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header mejorado con estadísticas */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-xl flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              WhatsApp Chat
            </h1>
            <p className="text-muted-foreground">
              Gestiona las comunicaciones con tu equipo de trabajo
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20 px-3 py-1">
              <div className="w-2 h-2 bg-[#25D366] rounded-full mr-2 animate-pulse"></div>
              Conectado
            </Badge>
          </div>
        </div>

        {/* Cards de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-[#25D366]/5 to-[#25D366]/10 border-[#25D366]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#25D366]/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-[#25D366]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{messages.length}</p>
                <p className="text-xs text-muted-foreground">Mensajes</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{contacts.length}</p>
                <p className="text-xs text-muted-foreground">Contactos Activos</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">98%</p>
                <p className="text-xs text-muted-foreground">Entregados</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <FileCode className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{templates.length}</p>
                <p className="text-xs text-muted-foreground">Plantillas</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs mejoradas */}
      <Card className="bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 h-12">
            <TabsTrigger value="conversations" className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <MessageSquare className="w-4 h-4" />
              <span className="font-medium">Conversaciones</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <MessageCircleCode className="w-4 h-4" />
              <span className="font-medium">Plantillas</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Users className="w-4 h-4" />
              <span className="font-medium">Contactos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="mt-6 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
              {/* Lista de contactos */}
              <div className="lg:col-span-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Contactos</h3>
                    <Badge variant="outline">
                      {contacts.length} contactos
                    </Badge>
                  </div>
                  
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {contacts.map((contact) => (
                        <Card
                          key={contact.id}
                          className={`p-3 cursor-pointer transition-all hover:shadow-sm ${
                            selectedContact?.id === contact.id 
                              ? 'bg-[#25D366]/10 border-[#25D366]/30' 
                              : 'bg-card hover:bg-accent/50'
                          }`}
                          onClick={() => handleContactSelect(contact)}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                {contact.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'N/A'}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">
                                {contact.name || 'Sin nombre'}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {contact.role || 'Sin rol'}
                              </p>
                              <div className="flex items-center space-x-1 mt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          contact.is_active ? 'bg-[#25D366]' : 'bg-gray-400'
                        }`} />
                        <span className="text-xs text-muted-foreground">
                          {contact.is_active ? 'En línea' : 'Desconectado'}
                        </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                      
                      {contacts.length === 0 && (
                        <div className="text-center py-8">
                          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No hay contactos disponibles</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Área de chat */}
              <div className="lg:col-span-2">
                {selectedContact ? (
                  <div className="flex flex-col h-full bg-muted/30 rounded-lg">
                    {/* Header del chat */}
                    <div className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur rounded-t-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {selectedContact.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'N/A'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{selectedContact.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <div className="w-2 h-2 bg-[#25D366] rounded-full"></div>
                            En línea
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => exportConversation(selectedContact.id)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Mensajes */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <MessageBubble key={message.id} message={message} />
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Input de mensaje */}
                    <div className="p-4 border-t border-border bg-background/80 backdrop-blur rounded-b-lg">
                      <div className="flex items-center space-x-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Escribe un mensaje..."
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button size="sm" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedContacts([selectedContact.id]);
                            setIsTemplateDialogOpen(true);
                          }}
                        >
                          <MessageCircleCode className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        Selecciona un contacto
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Elige un contacto de la lista para comenzar una conversación
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-6 p-6">
            <TemplatesTab />
          </TabsContent>

          <TabsContent value="contacts" className="mt-6 p-6">
            <ContactsTab />
          </TabsContent>
        </Tabs>
      </Card>

      <TemplateSelectionDialog />
    </div>
  );
}