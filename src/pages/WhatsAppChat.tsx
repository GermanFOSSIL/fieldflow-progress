import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WhatsAppStatusBar } from "@/components/WhatsAppStatusBar";
import { useWhatsAppBot } from "@/hooks/useWhatsAppBot";
import { useDataQueryBot } from "@/hooks/useDataQueryBot";
import { useProject } from "@/contexts/ProjectContext";
import { ProjectSelector } from "@/components/whatsapp/ProjectSelector";
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Bot, 
  Check, 
  CheckCheck,
  Camera,
  MapPin,
  Clock,
  AlertCircle,
  Wrench,
  BarChart3
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'bot';
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'location' | 'image' | 'report' | 'alert' | 'inventory' | 'weather' | 'help' | 'template';
  metadata?: any;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  role: string;
  lastMessage?: string;
  unreadCount: number;
  isOnline: boolean;
}

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Carlos Mendoza",
    phone: "+56987654321",
    role: "Jefe de Obra",
    lastMessage: "El avance de las fundaciones está al 85%",
    unreadCount: 2,
    isOnline: true
  },
  {
    id: "2", 
    name: "Ana Rodríguez",
    phone: "+56912345678",
    role: "Supervisor Eléctrico",
    lastMessage: "Instalación de tableros completada",
    unreadCount: 0,
    isOnline: false
  },
  {
    id: "3",
    name: "Miguel Torres",
    phone: "+56999888777",
    role: "Capataz",
    lastMessage: "Necesitamos más cemento para mañana",
    unreadCount: 1,
    isOnline: true
  },
  {
    id: "4",
    name: "Patricia Silva",
    phone: "+56955444333",
    role: "Supervisor de Calidad",
    lastMessage: "Revisión de estructura OK",
    unreadCount: 0,
    isOnline: true
  }
];

export default function WhatsAppChat() {
  const { processMessage, isProcessing } = useWhatsAppBot();
  const { processDataQuery, isProcessing: isQueryProcessing } = useDataQueryBot();
  const { selectedProject } = useProject();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(mockContacts[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mensajes iniciales para el contacto seleccionado
  useEffect(() => {
    if (selectedContact?.id === "1") {
      setMessages([
        {
          id: "1",
          text: "Buenos días! El equipo ya está en obra desde las 7:00 AM",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          sender: 'user',
          status: 'read',
          type: 'text'
        },
        {
          id: "2", 
          text: "¡Perfecto Carlos! Gracias por confirmar. ¿Cómo va el avance de las fundaciones?",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
          sender: 'bot',
          status: 'read',
          type: 'text'
        },
        {
          id: "3",
          text: "El avance de las fundaciones está al 85%. Estimamos terminar mañana por la tarde",
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          sender: 'user',
          status: 'read',
          type: 'text'
        },
        {
          id: "4",
          text: "📊 Excelente progreso! He actualizado el sistema:\n\n✅ Fundaciones: 85%\n⏳ Meta: 90% para esta semana\n\n¿Hay algún problema que reportar?",
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 2 * 60 * 1000),
          sender: 'bot',
          status: 'read',
          type: 'report'
        }
      ]);
    } else {
      setMessages([]);
    }
  }, [selectedContact]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: new Date(),
      sender: 'user',
      status: 'sent',
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = newMessage;
    setNewMessage("");

    // Procesar mensaje con el bot inteligente
    try {
      // First try data query bot for database queries
      const queryKeywords = ['progreso', 'avance', 'inventario', 'reporte', 'actividad', 'personal', 'alerta', 'sistema'];
      const isDataQuery = queryKeywords.some(keyword => 
        messageToProcess.toLowerCase().includes(keyword)
      );

      let botResponse;
      if (isDataQuery && selectedProject) {
        const dataResponse = await processDataQuery(messageToProcess, selectedProject.id);
        botResponse = {
          text: dataResponse.text || 'Consulta procesada exitosamente',
          type: 'report',
          metadata: dataResponse.metadata
        };
      } else {
        botResponse = await processMessage(messageToProcess, selectedContact.id);
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        timestamp: new Date(),
        sender: 'bot',
        status: 'sent',
        type: botResponse.type,
        metadata: botResponse.metadata
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'report': return <Camera className="h-4 w-4" />;
      case 'location': return <MapPin className="h-4 w-4" />;
      case 'alert': return <AlertCircle className="h-4 w-4" />;
      case 'weather': return <Clock className="h-4 w-4" />;
      case 'inventory': return <Wrench className="h-4 w-4" />;
      case 'template': return <MessageCircle className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full max-w-7xl mx-auto p-4">
      <div className="mb-4">
        <ProjectSelector />
      </div>
      <WhatsAppStatusBar />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
        
        {/* Lista de Contactos */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">WhatsApp Business</CardTitle>
            </div>
            <CardDescription>
              Chat en tiempo real con el equipo de obra
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-20rem)]">
              {mockContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-3 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedContact?.id === contact.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {contact.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium truncate">{contact.name}</h4>
                        {contact.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {contact.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{contact.role}</p>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {contact.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Principal */}
        <Card className="lg:col-span-3 flex flex-col">
          {selectedContact ? (
            <>
              {/* Header del Chat */}
              <CardHeader className="border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {selectedContact.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{selectedContact.name}</h3>
                      {selectedContact.isOnline && (
                        <div className="flex items-center gap-1 text-xs text-success">
                          <div className="w-2 h-2 bg-success rounded-full" />
                          En línea
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedContact.role} • {selectedContact.phone}
                    </p>
                  </div>
                  <Button variant="outline" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {/* Mensajes */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[calc(100vh-24rem)] p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {message.sender === 'bot' && getMessageIcon(message.type)}
                            <div className="flex-1">
                              <p className="text-sm whitespace-pre-line">{message.text}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs opacity-70">
                                  {formatTime(message.timestamp)}
                                </span>
                                {message.sender === 'user' && (
                                  <div className="ml-2">
                                    {message.status === 'read' ? (
                                      <CheckCheck className="h-3 w-3 text-blue-400" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {(isProcessing || isQueryProcessing) && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-4 py-2 max-w-[70%]">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-primary" />
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </CardContent>

              {/* Input de Mensaje */}
              <div className="border-t border-border p-4">
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
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecciona un contacto</h3>
                <p className="text-muted-foreground">
                  Elige un contacto para comenzar a chatear
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}