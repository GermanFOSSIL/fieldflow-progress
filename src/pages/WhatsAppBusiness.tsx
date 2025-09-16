import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon,
  MapPin,
  Users,
  TrendingUp,
  Download,
  Plus
} from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";

interface Contact {
  id: string;
  name: string;
  phone: string;
  role: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'report' | 'location';
  status: 'sent' | 'delivered' | 'read';
  attachments?: string[];
  reportData?: {
    activity: string;
    progress: number;
    location: string;
  };
}

export default function WhatsAppBusiness() {
  const { selectedProject } = useProject();
  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Carlos Mendez',
      phone: '+52 555 123 4567',
      role: 'Supervisor de Estructura',
      lastMessage: 'Torre A - 85% completado',
      timestamp: '10:30 AM',
      unread: 2,
      isOnline: true
    },
    {
      id: '2',
      name: 'Ana López',
      phone: '+52 555 987 6543',
      role: 'Operario Excavación',
      lastMessage: 'Necesito aprobación para excavación sector B',
      timestamp: '09:15 AM',
      unread: 0,
      isOnline: false
    },
    {
      id: '3',
      name: 'Miguel Torres',
      phone: '+52 555 456 7890',
      role: 'Instalador Eléctrico',
      lastMessage: '📷 Foto enviada',
      timestamp: 'Ayer',
      unread: 1,
      isOnline: true
    }
  ]);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Carlos Mendez',
      text: 'Buenos días! Reporte de avance Torre A',
      timestamp: '09:00 AM',
      type: 'text',
      status: 'read'
    },
    {
      id: '2',
      sender: 'Carlos Mendez',
      text: '',
      timestamp: '09:05 AM',
      type: 'report',
      status: 'read',
      reportData: {
        activity: 'Estructura Torre A - Piso 5',
        progress: 85,
        location: 'Torre A, Nivel 5'
      }
    },
    {
      id: '3',
      sender: 'Carlos Mendez',
      text: '',
      timestamp: '09:10 AM',
      type: 'image',
      status: 'read',
      attachments: ['estructura-torre-a.jpg', 'detalle-conexiones.jpg']
    },
    {
      id: '4',
      sender: 'bot',
      text: 'Reporte recibido y enviado para aprobación. Referencia: #REP-2024-001',
      timestamp: '09:11 AM',
      type: 'text',
      status: 'delivered'
    },
    {
      id: '5',
      sender: 'Carlos Mendez',
      text: 'Torre A - 85% completado',
      timestamp: '10:30 AM',
      type: 'text',
      status: 'delivered'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
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
    <div className="h-[calc(100vh-8rem)] flex bg-background">
      {/* Contacts Sidebar */}
      <div className="w-1/3 border-r bg-muted/30">
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">WhatsApp Business</h2>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Contacto
            </Button>
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            Proyecto: {selectedProject?.name || 'Ninguno seleccionado'}
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{contacts.length} contactos</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{contacts.reduce((acc, c) => acc + c.unread, 0)} sin leer</span>
            </div>
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-120px)]">
          <div className="p-2 space-y-1">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedContact?.id === contact.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-industrial-gradient text-white text-sm">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {contact.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate">{contact.name}</p>
                      <span className="text-xs text-muted-foreground">{contact.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{contact.role}</p>
                    <p className="text-sm truncate">{contact.lastMessage}</p>
                  </div>
                  {contact.unread > 0 && (
                    <Badge className="bg-primary text-primary-foreground text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {contact.unread}
                    </Badge>
                  )}
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
                      {selectedContact.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedContact.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedContact.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedContact.isOnline ? "default" : "secondary"}>
                    {selectedContact.isOnline ? "En línea" : "Desconectado"}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'supervisor' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${
                      message.sender === 'supervisor' 
                        ? 'bg-primary text-primary-foreground' 
                        : message.sender === 'bot' 
                        ? 'bg-muted border' 
                        : 'bg-background border'
                    } rounded-lg p-3`}>
                      {message.type === 'text' && (
                        <p className="text-sm">{message.text}</p>
                      )}
                      
                      {message.type === 'report' && message.reportData && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <TrendingUp className="h-4 w-4" />
                            Reporte de Avance
                          </div>
                          <div className="bg-background/10 rounded p-2 space-y-1">
                            <p className="text-sm font-medium">{message.reportData.activity}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-grow bg-background/20 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-full rounded-full" 
                                  style={{ width: `${message.reportData.progress}%` }}
                                />
                              </div>
                              <span className="text-xs">{message.reportData.progress}%</span>
                            </div>
                            <p className="text-xs flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {message.reportData.location}
                            </p>
                          </div>
                        </div>
                      )}

                      {message.type === 'image' && message.attachments && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <ImageIcon className="h-4 w-4" />
                            {message.attachments.length} imágenes
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className="bg-background/10 rounded p-2 text-center">
                                <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-70" />
                                <p className="text-xs truncate">{attachment}</p>
                              </div>
                            ))}
                          </div>
                          <Button variant="secondary" size="sm" className="w-full">
                            <Download className="h-3 w-3 mr-1" />
                            Descargar todas
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">{message.timestamp}</span>
                        {message.sender === 'supervisor' && getStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Los reportes se envían automáticamente al sistema de aprobaciones
              </p>
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
  );
}