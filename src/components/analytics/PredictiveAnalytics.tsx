import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Clock, 
  BarChart3,
  Activity,
  Zap,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";

interface RiskIndicator {
  id: string;
  system: string;
  status: 'on-track' | 'warning' | 'critical';
  risk_score: number;
  predicted_delay?: number;
  confidence: number;
  factors: string[];
}

interface Trend {
  metric: string;
  current: number;
  predicted: number;
  change: number;
  direction: 'up' | 'down' | 'stable';
}

interface EarlyAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  probability: number;
  estimated_impact: string;
  recommended_action: string;
}

export function PredictiveAnalytics() {
  const { selectedProject } = useProject();
  const [indicators, setIndicators] = useState<RiskIndicator[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [alerts, setAlerts] = useState<EarlyAlert[]>([]);

  useEffect(() => {
    // Mock data - Replace with real ML predictions
    const mockIndicators: RiskIndicator[] = [
      {
        id: '1',
        system: 'Instrumentación',
        status: 'on-track',
        risk_score: 15,
        confidence: 92,
        factors: ['Recursos disponibles', 'Cronograma ajustado']
      },
      {
        id: '2',
        system: 'Soldadura Principal',
        status: 'warning',
        risk_score: 65,
        predicted_delay: 5,
        confidence: 87,
        factors: ['Clima adverso', 'Escasez de materiales']
      },
      {
        id: '3',
        system: 'Tubería Secundaria',
        status: 'critical',
        risk_score: 85,
        predicted_delay: 12,
        confidence: 94,
        factors: ['Problemas de calidad', 'Recursos limitados', 'Dependencias externas']
      },
      {
        id: '4',
        system: 'Instalación Eléctrica',
        status: 'on-track',
        risk_score: 25,
        confidence: 89,
        factors: ['Equipo experimentado', 'Materiales disponibles']
      }
    ];

    const mockTrends: Trend[] = [
      {
        metric: 'Velocidad de Progreso',
        current: 2.3,
        predicted: 2.8,
        change: 21.7,
        direction: 'up'
      },
      {
        metric: 'Calidad Promedio',
        current: 9.2,
        predicted: 9.0,
        change: -2.2,
        direction: 'down'
      },
      {
        metric: 'Eficiencia de Recursos',
        current: 87,
        predicted: 91,
        change: 4.6,
        direction: 'up'
      },
      {
        metric: 'Tiempo por Actividad',
        current: 4.2,
        predicted: 3.8,
        change: -9.5,
        direction: 'down'
      }
    ];

    const mockAlerts: EarlyAlert[] = [
      {
        id: '1',
        title: 'Posible Retraso en Soldadura',
        description: 'El modelo predice un retraso de 5-7 días en la soldadura principal debido a factores climáticos y disponibilidad de materiales.',
        severity: 'medium',
        probability: 78,
        estimated_impact: '5-7 días de retraso',
        recommended_action: 'Acelerar pedido de materiales y considerar trabajo en turnos'
      },
      {
        id: '2',
        title: 'Degradación de Calidad Detectada',
        description: 'Tendencia descendente en métricas de calidad en las últimas 3 semanas. Posible impacto en inspecciones finales.',
        severity: 'high',
        probability: 85,
        estimated_impact: 'Retrabajos 10-15%',
        recommended_action: 'Reforzar controles de calidad y training adicional'
      },
      {
        id: '3',
        title: 'Optimización de Recursos',
        description: 'Oportunidad identificada para mejorar eficiencia del Equipo 3 mediante redistribución de tareas.',
        severity: 'low',
        probability: 67,
        estimated_impact: 'Mejora 12-18% eficiencia',
        recommended_action: 'Implementar redistribución gradual de responsabilidades'
      }
    ];

    setIndicators(mockIndicators);
    setTrends(mockTrends);
    setAlerts(mockAlerts);
  }, [selectedProject]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'on-track': 'default',
      'warning': 'secondary',
      'critical': 'destructive'
    };
    
    return variants[status as keyof typeof variants] || 'default';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4" />
            <p>Selecciona un proyecto para ver analytics predictivos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Predictivo</h2>
          <p className="text-muted-foreground">
            Proyecto: {selectedProject.name} • Actualizado en tiempo real
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Activity className="h-3 w-3" />
          IA Activa
        </Badge>
      </div>

      <Tabs defaultValue="indicators" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="indicators">Indicadores de Riesgo</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="alerts">Alertas Tempranas</TabsTrigger>
        </TabsList>

        <TabsContent value="indicators" className="space-y-4">
          <div className="grid gap-4">
            {indicators.map((indicator) => (
              <Card key={indicator.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{indicator.system}</CardTitle>
                    <Badge variant={getStatusBadge(indicator.status) as any}>
                      {indicator.status === 'on-track' ? 'En Ruta' :
                       indicator.status === 'warning' ? 'Advertencia' : 'Crítico'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Riesgo</p>
                      <div className="flex items-center gap-2">
                        <Progress value={indicator.risk_score} className="flex-1" />
                        <span className={`text-sm font-medium ${getStatusColor(indicator.status)}`}>
                          {indicator.risk_score}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Confianza</p>
                      <p className="text-lg font-semibold">{indicator.confidence}%</p>
                    </div>
                    {indicator.predicted_delay && (
                      <div>
                        <p className="text-sm text-muted-foreground">Retraso Predicho</p>
                        <p className="text-lg font-semibold text-red-600">
                          {indicator.predicted_delay} días
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Estado</p>
                      <div className="flex items-center gap-1">
                        {indicator.status === 'on-track' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : indicator.status === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm ${getStatusColor(indicator.status)}`}>
                          {indicator.status === 'on-track' ? 'Óptimo' :
                           indicator.status === 'warning' ? 'Precaución' : 'Atención'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Factores Identificados:</p>
                    <div className="flex flex-wrap gap-1">
                      {indicator.factors.map((factor, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trends.map((trend, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    {trend.metric}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Actual</span>
                      <span className="text-lg font-semibold">{trend.current}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Predicción</span>
                      <span className="text-lg font-semibold">{trend.predicted}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Cambio</span>
                      <div className="flex items-center gap-1">
                        {trend.direction === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : trend.direction === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        ) : (
                          <Activity className="h-4 w-4 text-gray-600" />
                        )}
                        <span className={`font-medium ${
                          trend.direction === 'up' ? 'text-green-600' :
                          trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`h-5 w-5 mt-0.5 ${getSeverityColor(alert.severity)}`} />
                      <div>
                        <CardTitle className="text-lg">{alert.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.description}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={alert.severity === 'high' ? 'destructive' : 
                              alert.severity === 'medium' ? 'secondary' : 'outline'}
                    >
                      {alert.severity === 'high' ? 'Alta' :
                       alert.severity === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Probabilidad</p>
                      <div className="flex items-center gap-2">
                        <Progress value={alert.probability} className="flex-1" />
                        <span className="text-sm font-medium">{alert.probability}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Impacto Estimado</p>
                      <p className="text-sm font-medium">{alert.estimated_impact}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Confianza IA</p>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-blue-600" />
                        <span className="text-sm">Alta</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Acción Recomendada:</p>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm">{alert.recommended_action}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}