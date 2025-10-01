import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useProject } from "@/contexts/ProjectContext";
import { useProfile } from "@/hooks/useProfile";
import { useChatAI } from "@/hooks/useChatAI";
import { useDataQueryBot } from "@/hooks/useDataQueryBot";
import {
  Bot,
  Send,
  User,
  Loader2,
  BarChart3,
  Calendar,
  AlertTriangle,
  FileText,
} from "lucide-react";

interface BotMessage {
  id: string;
  content: string;
  type: 'user' | 'bot' | 'system';
  timestamp: Date;
  quickActions?: QuickAction[];
}

interface QuickAction {
  label: string;
  command: string;
  icon?: any;
}

export function IntelligentBot() {
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { selectedProject } = useProject();
  const { profile } = useProfile();
  const { streamChat, isStreaming } = useChatAI();
  const { processDataQuery } = useDataQueryBot();

  const quickCommands: QuickAction[] = [
    { label: "Estado del proyecto", command: "/estado", icon: BarChart3 },
    { label: "Reportes hoy", command: "/reportes-hoy", icon: Calendar },
    { label: "Alertas pendientes", command: "/alertas", icon: AlertTriangle },
    { label: "Avance general", command: "/avance", icon: FileText },
  ];

  useEffect(() => {
    if (profile || selectedProject) {
      const welcomeMsg: BotMessage = {
        id: Date.now().toString(),
        content: `¡Hola ${profile?.full_name || 'Usuario'}! 👋\n\nSoy tu asistente inteligente para el proyecto ${selectedProject?.name || 'actual'}.\n\n¿En qué puedo ayudarte hoy?`,
        type: 'bot',
        timestamp: new Date(),
        quickActions: quickCommands
      };
      setMessages([welcomeMsg]);
    }
  }, [profile?.id, selectedProject?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || isStreaming) return;

    const userMessage: BotMessage = {
      id: Date.now().toString(),
      content: input,
      type: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Si es un comando rápido, usar el bot de consulta de datos
      if (input.startsWith('/')) {
        const response = await handleQuickCommandResponse(input);
        const botMessage: BotMessage = {
          id: (Date.now() + 1).toString(),
          content: response,
          type: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      } else {
        // Usar AI streaming para consultas de lenguaje natural
        const allMessages = [...messages, userMessage];
        const aiMessages = allMessages
          .filter(m => m.type !== 'system')
          .map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content }));

        let assistantContent = "";
        const assistantId = (Date.now() + 1).toString();

        await streamChat({
          messages: aiMessages as any,
          projectContext: selectedProject,
          onDelta: (chunk) => {
            assistantContent += chunk;
            setMessages(prev => {
              const lastMsg = prev[prev.length - 1];
              if (lastMsg?.id === assistantId) {
                return prev.map(m => 
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, {
                id: assistantId,
                content: assistantContent,
                type: 'bot' as const,
                timestamp: new Date(),
              }];
            });
          },
          onDone: () => {
            setIsLoading(false);
          },
        });
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      const errorMessage: BotMessage = {
        id: (Date.now() + 1).toString(),
        content: "❌ Lo siento, ocurrió un error al procesar tu mensaje. Por favor intenta nuevamente.",
        type: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleQuickCommandResponse = async (command: string): Promise<string> => {
    switch (command) {
      case '/estado':
        const projectResponse = await processDataQuery('estado del proyecto', selectedProject?.id);
        return projectResponse.text;
      
      case '/reportes-hoy':
        const todayResponse = await processDataQuery('reportes de hoy', selectedProject?.id);
        return todayResponse.text;
      
      case '/alertas':
        const alertsResponse = await processDataQuery('alertas pendientes', selectedProject?.id);
        return alertsResponse.text;
      
      case '/avance':
        const progressResponse = await processDataQuery('avance general', selectedProject?.id);
        return progressResponse.text;
      
      default:
        return `Comando desconocido: ${command}`;
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="font-semibold">Asistente Inteligente</h2>
          <p className="text-sm text-muted-foreground">
            {selectedProject?.name || 'Proyecto no seleccionado'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'bot' && (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-lg p-3 max-w-md ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {formatTimestamp(message.timestamp)}
                </span>
                
                {message.quickActions && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.quickActions.map((action) => (
                      <Button
                        key={action.command}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInput(action.command);
                        }}
                        className="text-xs"
                      >
                        {action.icon && <action.icon className="h-3 w-3 mr-1" />}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          
          {(isLoading || isStreaming) && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2 mb-2">
          {quickCommands.map((cmd) => (
            <Button
              key={cmd.command}
              variant="outline"
              size="sm"
              onClick={() => {
                setInput(cmd.command);
              }}
              className="text-xs"
            >
              {cmd.icon && <cmd.icon className="h-3 w-3 mr-1" />}
              {cmd.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu mensaje o comando..."
            disabled={isLoading || isStreaming}
          />
          <Button onClick={handleSend} disabled={isLoading || isStreaming}>
            {isLoading || isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
