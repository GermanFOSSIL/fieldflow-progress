import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Send, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  BarChart3,
  FileText,
  Lightbulb,
  Target,
  Zap
} from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { useDataQueryBot } from "@/hooks/useDataQueryBot";

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type: 'text' | 'chart' | 'recommendation' | 'alert';
  metadata?: any;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  action: string;
}

export default function AIAssistant() {
  const { selectedProject } = useProject();
  const { processDataQuery, isProcessing: isBotProcessing } = useDataQueryBot();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      content: 'Hola! Soy tu asistente de IA para análisis de proyectos. Puedo ayudarte con análisis de progreso, predicciones, identificación de riesgos y recomendaciones. ¿En qué puedo ayudarte?',
      timestamp: '09:00 AM',
      type: 'text'
    },
    {
      id: '2',
      sender: 'assistant',
      content: 'He analizado el proyecto actual y detecté algunas oportunidades de mejora:',
      timestamp: '09:01 AM',
      type: 'recommendation',
      metadata: {
        recommendations: [
          'El sistema de estructuras está 5% por debajo del objetivo',
          'Se recomienda aumentar la cuadrilla de instalaciones eléctricas',
          'La actividad de excavación sector B necesita atención'
        ]
      }
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Análisis de Progreso',
      description: 'Evalúa el progreso actual vs planificado',
      icon: TrendingUp,
      color: 'blue',
      action: 'Analiza el progreso del proyecto actual y muestra métricas clave'
    },
    {
      id: '2',
      title: 'Predicción de Entregas',
      description: 'Estima fechas de finalización',
      icon: Target,
      color: 'green',
      action: 'Predice las fechas de entrega basado en el avance actual'
    },
    {
      id: '3',
      title: 'Identificar Riesgos',
      description: 'Detecta posibles retrasos o problemas',
      icon: AlertTriangle,
      color: 'orange',
      action: 'Identifica riesgos potenciales en el proyecto actual'
    },
    {
      id: '4',
      title: 'Optimizar Recursos',
      description: 'Sugiere mejoras en asignación de recursos',
      icon: Zap,
      color: 'purple',
      action: 'Analiza la asignación de recursos y sugiere optimizaciones'
    }
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedProject) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsProcessing(true);

    try {
      // Use real data query bot
      const response = await processDataQuery(currentInput, selectedProject.id);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: response.text,
        timestamp: new Date().toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        type: 'text',
        metadata: response.metadata
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: 'Lo siento, ocurrió un error al procesar tu consulta. Por favor intenta nuevamente.',
        timestamp: new Date().toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    if (!selectedProject) return;
    
    setIsProcessing(true);
    
    try {
      const response = await processDataQuery(action.action, selectedProject.id);
      
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'assistant',
        content: response.text,
        timestamp: new Date().toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        type: 'text',
        metadata: response.metadata
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'assistant',
        content: 'Lo siento, no pude procesar esta acción. Por favor intenta nuevamente.',
        timestamp: new Date().toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="h-[calc(100vh-8rem)] flex bg-background">
      {/* Sidebar with Quick Actions */}
      <div className="w-1/3 border-r bg-muted/30 p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">FieldProgress AI Assistant</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Asistente inteligente para análisis de datos del proyecto
          </p>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Brain className="w-3 h-3 mr-1" />
            Conectado a {selectedProject?.name || 'Ningún proyecto'}
          </Badge>
        </div>

        <Separator className="my-4" />

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Acciones Rápidas
          </h3>
          
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Card 
                key={action.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleQuickAction(action)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-${action.color}-100`}>
                      <IconComponent className={`h-4 w-4 text-${action.color}-600`} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-medium text-sm">{action.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Capacidades
          </h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-3 w-3" />
              <span>Análisis de métricas en tiempo real</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-3 w-3" />
              <span>Predicciones basadas en IA</span>
            </div>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-3 w-3" />
              <span>Recomendaciones inteligentes</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3" />
              <span>Detección proactiva de riesgos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium">FieldProgress AI</h3>
              <p className="text-sm text-muted-foreground">
                Asistente especializado en construcción
              </p>
            </div>
            <div className="ml-auto">
              <Badge className="bg-green-500/10 text-green-700 border-green-200">
                <Sparkles className="w-3 h-3 mr-1" />
                En línea
              </Badge>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background border shadow-sm'
                } rounded-lg p-4`}>
                  
                  {message.type === 'text' && (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}

                  {message.type === 'recommendation' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Lightbulb className="h-4 w-4 text-orange-500" />
                        Recomendaciones del Sistema
                      </div>
                      <p className="text-sm">{message.content}</p>
                      {message.metadata?.recommendations && (
                        <div className="space-y-2 pt-2">
                          {message.metadata.recommendations.map((rec: string, index: number) => (
                            <div key={index} className="flex items-start gap-2 p-2 rounded bg-muted/50">
                              <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span className="text-xs">{rec}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-muted/20">
                    <span className="text-xs opacity-70">{message.timestamp}</span>
                    {message.sender === 'assistant' && (
                      <Badge variant="secondary" className="text-xs">
                        <Brain className="w-2 h-2 mr-1" />
                        IA
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {(isProcessing || isBotProcessing) && (
              <div className="flex justify-start">
                <div className="bg-background border shadow-sm rounded-lg p-4 max-w-[80%]">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>El asistente está analizando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t bg-background">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Pregunta sobre el progreso, riesgos, predicciones..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isProcessing || isBotProcessing || !selectedProject}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputMessage.trim() || isProcessing || isBotProcessing || !selectedProject}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center max-w-4xl mx-auto">
            El asistente IA analiza datos en tiempo real del proyecto para proporcionar insights precisos
          </p>
        </div>
      </div>
    </div>
  );
}