import { useState } from "react";
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

export default function WhatsAppBusiness() {
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
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'supervisor',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: 'text',
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    try {
      saveMessage({
        conversationId: selectedContact.id,
        senderType: 'bot',
        messageText: newMessage,
        messageType: 'text'
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleSendTemplate = async (templateId: string, customData?: any) => {
    if (!selectedContacts.length && !selectedContact) {
      toast({
        title: "Error",
        description: "Selecciona al menos un contacto para enviar el template",
        variant: "destructive"
      });
      return;
    }

    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const recipients = selectedContacts.length > 0 ? selectedContacts : [selectedContact.id];
    let templateMessage = "";

    // Generate template content based on type
    if (template.template_type === 'menu') {
      templateMessage = generateMenuResponse(template);
    } else if (template.template_type === 'progress_form') {
      templateMessage = generateFormResponse(template);
    } else {
      templateMessage = template.content.title || "Template message";
    }

    try {
      for (const contactId of recipients) {
        const contact = contacts.find(c => c.id === contactId);
        if (contact) {
          // Create conversation if doesn't exist and save message
          saveMessage({
            conversationId: contactId,
            senderType: 'bot',
            messageText: templateMessage,
            messageType: 'template',
            templateData: { template_id: templateId, template_name: template.name }
          });
        }
      }

      toast({
        title: "Template enviado",
        description: `Template "${template.name}" enviado a ${recipients.length} contacto(s)`,
      });

      setIsTemplateDialogOpen(false);
      setSelectedContacts([]);
    } catch (error) {
      console.error('Error sending template:', error);
      toast({
        title: "Error",
        description: "Error al enviar el template",
        variant: "destructive"
      });
    }
  };

  const createNewConversation = async (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return null;

    try {
      createConversation({
        contactId: contactId,
        projectId: selectedProject?.id || '',
        title: `Chat con ${contact.name}`
      });
      return contactId; // Return contactId as conversation identifier
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!conversationId) return;
    
    setIsLoadingMessages(true);
    try {
      const msgs = await fetchMessages(conversationId);
      const formattedMessages: Message[] = msgs.map(msg => ({
        id: msg.id,
        sender: msg.sender_type === 'bot' ? 'supervisor' : 'contact',
        text: msg.message_text,
        timestamp: new Date(msg.created_at).toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        type: msg.message_type as any || 'text',
        status: 'delivered',
        templateData: msg.template_data ? {
          templateName: msg.template_data.template_name,
          templateType: msg.template_data.template_type
        } : undefined
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact);
    if (contact.id) {
      loadMessages(contact.id);
    } else {
      setMessages([]);
    }
  };

  const handleContactCheckbox = (contactId: string, checked: boolean) => {
    if (checked) {
      setSelectedContacts(prev => [...prev, contactId]);
    } else {
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle2 className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCircle2 className="h-3 w-3 text-blue-500" />;
      case 'read':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold">WhatsApp Business</h1>
            <p className="text-muted-foreground">
              Proyecto: {selectedProject?.name || 'Ninguno seleccionado'}
            </p>
          </div>
          <TabsList className="grid w-auto grid-cols-3">
            <TabsTrigger value="conversations" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversaciones
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contactos
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="conversations" className="h-full m-0">
            <div className="h-full flex">
              {/* Contacts Sidebar */}
              <div className="w-1/3 border-r bg-muted/30">
                <div className="p-4 border-b bg-background">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Conversaciones</h3>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva
                    </Button>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{contacts?.length || 0} contactos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{conversations?.length || 0} conversaciones</span>
                    </div>
                  </div>
                </div>

                <ScrollArea className="h-[calc(100%-120px)]">
                  <div className="p-2 space-y-1">
                    {contactsLoading ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Cargando contactos...
                      </div>
                    ) : contacts?.map((contact) => (
                      <div
                        key={contact.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedContact?.id === contact.id
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleContactSelect(contact)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-industrial-gradient text-white text-sm">
                              {contact.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm truncate">{contact.name}</p>
                              <span className="text-xs text-muted-foreground">
                                {new Date().toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{contact.role}</p>
                            <p className="text-sm truncate">{contact.phone}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedContact ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b bg-background">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-industrial-gradient text-white">
                              {selectedContact.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{selectedContact.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedContact.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MessageCircleCode className="h-4 w-4 mr-2" />
                                Enviar Template
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Seleccionar Template</DialogTitle>
                                <DialogDescription>
                                  Elige un template para enviar a {selectedContact.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Select onValueChange={(value) => setSelectedTemplate(templates.find(t => t.id === value))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un template" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {templates.map((template) => (
                                      <SelectItem key={template.id} value={template.id}>
                                        <div className="flex items-center gap-2">
                                          <Badge variant="secondary">{template.template_type}</Badge>
                                          {template.name}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                
                                {selectedTemplate && (
                                  <div className="p-3 bg-muted rounded-lg">
                                    <h4 className="font-medium mb-2">Vista previa:</h4>
                                    <p className="text-sm">{selectedTemplate.content.title}</p>
                                  </div>
                                )}
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                                  Cancelar
                                </Button>
                                <Button 
                                  onClick={() => selectedTemplate && handleSendTemplate(selectedTemplate.id)}
                                  disabled={!selectedTemplate}
                                >
                                  Enviar Template
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                      {isLoadingMessages ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-muted-foreground">Cargando mensajes...</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender === 'supervisor' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[70%] ${
                                message.sender === 'supervisor' 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-background border'
                              } rounded-lg p-3`}>
                                {message.type === 'template' && message.templateData ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                      <FileCode className="h-4 w-4" />
                                      Template: {message.templateData.templateName}
                                    </div>
                                    <p className="text-sm">{message.text}</p>
                                  </div>
                                ) : (
                                  <p className="text-sm">{message.text}</p>
                                )}

                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs opacity-70">{message.timestamp}</span>
                                  {message.sender === 'supervisor' && getStatusIcon(message.status)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="p-4 border-t bg-background">
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Escribe un mensaje..."
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-muted/30">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium">Selecciona un contacto</p>
                      <p className="text-muted-foreground">Elige una conversación para comenzar</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="h-full m-0 p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Templates WhatsApp</h3>
                  <p className="text-muted-foreground">Gestiona templates para envío automático</p>
                </div>
                <Button asChild>
                  <a href="/whatsapp-templates">
                    <Settings className="h-4 w-4 mr-2" />
                    Administrar Templates
                  </a>
                </Button>
              </div>

              {isLoadingTemplates ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Cargando templates...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{template.template_type}</Badge>
                          <Button
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setIsTemplateDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.content.title}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="h-full m-0 p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Gestión de Contactos</h3>
                  <p className="text-muted-foreground">Administra contactos y envía templates masivos</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nuevo Contacto
                  </Button>
                  {selectedContacts.length > 0 && (
                    <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <MessageCircleCode className="h-4 w-4 mr-2" />
                          Enviar Template ({selectedContacts.length})
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Envío Masivo de Template</DialogTitle>
                          <DialogDescription>
                            Enviar template a {selectedContacts.length} contacto(s) seleccionado(s)
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Select onValueChange={(value) => setSelectedTemplate(templates.find(t => t.id === value))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un template" />
                            </SelectTrigger>
                            <SelectContent>
                              {templates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{template.template_type}</Badge>
                                    {template.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {selectedTemplate && (
                            <div className="p-3 bg-muted rounded-lg">
                              <h4 className="font-medium mb-2">Vista previa:</h4>
                              <p className="text-sm">{selectedTemplate.content.title}</p>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button 
                            onClick={() => selectedTemplate && handleSendTemplate(selectedTemplate.id)}
                            disabled={!selectedTemplate}
                          >
                            Enviar a {selectedContacts.length} contacto(s)
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <Checkbox
                    id="select-all"
                    checked={selectedContacts.length === contacts?.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedContacts(contacts?.map(c => c.id) || []);
                      } else {
                        setSelectedContacts([]);
                      }
                    }}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium">
                    Seleccionar todos ({contacts?.length || 0} contactos)
                  </label>
                </div>

                <div className="grid gap-4">
                  {contactsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-muted-foreground">Cargando contactos...</p>
                      </div>
                    </div>
                  ) : contacts?.map((contact) => (
                    <Card key={contact.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <Checkbox
                          id={`contact-${contact.id}`}
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={(checked) => handleContactCheckbox(contact.id, checked as boolean)}
                        />
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-industrial-gradient text-white">
                            {contact.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-sm text-muted-foreground">{contact.phone}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">{contact.role}</Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date().toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}