import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Calendar,
  BarChart3,
  FileText,
  Clock
} from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { useDataQueryBot } from "@/hooks/useDataQueryBot";
import { useProfile } from "@/hooks/useProfile";

interface BotMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  data?: any;
  quickActions?: QuickAction[];
}

interface QuickAction {
  label: string;
  command: string;
  icon: any;
}

export function IntelligentBot() {
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { selectedProject } = useProject();
  const { profile } = useProfile();
  const { processDataQuery } = useDataQueryBot();

  const quickCommands: QuickAction[] = [
    { label: "Avance General", command: "/avance", icon: TrendingUp },
    { label: "Problemas", command: "/problemas", icon: AlertTriangle },
    { label: "Equipo", command: "/equipo", icon: Users },
    { label: "Inventario", command: "/inventario", icon: BarChart3 },
    { label: "Reportes", command: "/reportes", icon: FileText },
    { label: "Cronograma", command: "/cronograma", icon: Calendar }
  ];

  useEffect(() => {
    // Welcome message
    const welcomeMessage: BotMessage = {
      id: 'welcome',
      type: 'system',
      content: `¡Hola ${profile?.full_name || 'Usuario'}! 👋\n\nSoy tu asistente inteligente de FieldProgress. Puedo ayudarte con:\n\n🔹 Consultas sobre el progreso del proyecto\n🔹 Información en tiempo real de actividades\n🔹 Reportes y análisis personalizados\n🔹 Alertas y notificaciones importantes\n\nUsa los comandos rápidos o pregúntame lo que necesites.`,
      timestamp: new Date(),
      quickActions: quickCommands
    };
    setMessages([welcomeMessage]);
  }, [profile, selectedProject]);

  const handleQuickCommand = async (command: string) => {
    await handleSend(command);
  };

  const handleSend = async (message?: string) => {
    const messageText = message || input;
    if (!messageText.trim()) return;

    const userMessage: BotMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let botResponse: BotMessage;

      if (messageText.startsWith('/')) {
        // Handle quick commands
        botResponse = await handleQuickCommandResponse(messageText);
      } else {
        // Handle natural language queries
        const result = await processDataQuery(messageText, selectedProject?.id);
        botResponse = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: result.text || "No pude encontrar información específica sobre tu consulta.",
          timestamp: new Date(),
          data: result.metadata?.results
        };
      }

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorMessage: BotMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "Lo siento, hubo un error al procesar tu solicitud. Intenta nuevamente.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickCommandResponse = async (command: string): Promise<BotMessage> => {
    if (!selectedProject) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: "⚠️ Primero selecciona un proyecto para obtener información específica.",
        timestamp: new Date()
      };
    }

    // Mock responses based on commands - Replace with real data queries
    const responses = {
      '/avance': {
        content: `📊 **Progreso del Proyecto: ${selectedProject.name}**\n\n• Progreso General: **68%**\n• Actividades Completadas: **156/230**\n• En Proceso: **12**\n• Retrasadas: **3**\n\n🎯 **Sistemas principales:**\n• Instrumentación: 85% ✅\n• Soldadura: 72% 🔧\n• Tubería: 45% ⚠️\n\n*Datos actualizados hace 5 minutos*`,
        data: { progress: 68, completed: 156, total: 230 }
      },
      '/problemas': {
        content: `🚨 **Problemas Detectados**\n\n**Críticos (3):**\n• Retraso en soldadura principal - 3 días\n• Falta material en Sector B\n• Inspección pendiente Línea 4\n\n**Advertencias (7):**\n• Clima adverso próxima semana\n• Revisión de calidad pendiente\n• Recursos limitados Equipo 3\n\n💡 *¿Necesitas más detalles de algún problema específico?*`,
        data: { critical: 3, warnings: 7 }
      },
      '/equipo': {
        content: `👥 **Estado del Equipo**\n\n**Personal Activo:** 24 trabajadores\n• Supervisores: 3\n• Soldadores: 8\n• Técnicos: 13\n\n**Disponibilidad:**\n• Presente: 22 ✅\n• Licencia: 1 📅\n• Ausente: 1 ❌\n\n**Productividad:** 94% (↑ 5% vs. semana pasada)`,
        data: { active: 24, productivity: 94 }
      },
      '/inventario': {
        content: `📦 **Estado del Inventario**\n\n**Materiales Críticos:**\n• Tubería 6": 85% disponible ✅\n• Soldadura E7018: 23% ⚠️\n• Válvulas: 67% ✅\n\n**Próximos Pedidos:**\n• Soldadura - Entrega: 2 días\n• Instrumentos - Entrega: 5 días\n\n*Actualizado en tiempo real*`,
        data: { materials: { pipe: 85, welding: 23, valves: 67 } }
      },
      '/reportes': {
        content: `📋 **Reportes Recientes**\n\n**Hoy (${new Date().toLocaleDateString()}):**\n• Reportes generados: 8\n• Pendientes aprobación: 3\n• Completados: 5\n\n**Esta semana:**\n• Total: 47 reportes\n• Calidad promedio: 9.2/10\n• Tiempo promedio: 12 min\n\n*¿Quieres generar un nuevo reporte?*`,
        data: { today: 8, pending: 3, quality: 9.2 }
      },
      '/cronograma': {
        content: `📅 **Cronograma del Proyecto**\n\n**Esta Semana:**\n• Lunes: Soldadura Sector A ✅\n• Martes: Inspección Línea 2 🔧\n• Miércoles: Instalación válvulas ⏳\n• Jueves: Pruebas hidráulicas ⏳\n• Viernes: Documentación ⏳\n\n**Próxima Semana:**\n• Inicio instrumentación avanzada\n• Pruebas de sistema completo\n\n*Cronograma actualizado diariamente*`,
        data: { thisWeek: 5, nextWeek: 3 }
      }
    };

    const response = responses[command as keyof typeof responses];
    
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: response?.content || "Comando no reconocido. Usa /avance, /problemas, /equipo, /inventario, /reportes o /cronograma",
      timestamp: new Date(),
      data: response?.data,
      quickActions: command === '/avance' ? [
        { label: "Ver Detalles", command: "/avance detallado", icon: BarChart3 },
        { label: "Exportar PDF", command: "/reporte avance", icon: FileText }
      ] : undefined
    };
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary animate-pulse" />
          <div>
            <h3 className="font-semibold">FieldProgress AI Assistant</h3>
            <p className="text-xs text-muted-foreground">
              {selectedProject ? `Proyecto: ${selectedProject.name}` : 'Selecciona un proyecto'}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="ml-auto">
          <Zap className="h-3 w-3 mr-1" />
          Activo
        </Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : message.type === 'system'
                    ? 'bg-muted border'
                    : 'bg-muted'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  <div className="text-xs opacity-70 mt-2">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              {message.quickActions && (
                <div className="flex flex-wrap gap-2 ml-2">
                  {message.quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickCommand(action.command)}
                      className="text-xs h-7"
                    >
                      <action.icon className="h-3 w-3 mr-1" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analizando datos...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregúntame sobre el proyecto o usa comandos rápidos..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={() => handleSend()} disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quick Commands */}
        <div className="flex flex-wrap gap-2 mt-3">
          {quickCommands.slice(0, 4).map((cmd, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => handleQuickCommand(cmd.command)}
              className="text-xs h-6"
            >
              <cmd.icon className="h-3 w-3 mr-1" />
              {cmd.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}