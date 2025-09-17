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
  XCircle,
  Loader2,
  Users,
  Calendar,
  AlertCircle
} from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useProject } from "@/contexts/ProjectContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function PredictiveAnalytics() {
  const { selectedProject } = useProject();
  
  const {
    projectMetrics,
    activityTrends,
    performanceMetrics,
    predictiveData,
    metricsLoading,
    trendsLoading,
    performanceLoading,
    predictiveLoading
  } = useAnalytics(selectedProject?.id);

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Selecciona un proyecto
          </h3>
          <p className="text-sm text-muted-foreground">
            Necesitas seleccionar un proyecto para ver el análisis predictivo
          </p>
        </div>
      </div>
    );
  }

  const isLoading = metricsLoading || trendsLoading || performanceLoading || predictiveLoading;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Análisis Predictivo</h1>
          <p className="text-muted-foreground">
            Análisis avanzado y predicciones del proyecto
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {selectedProject.name}
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Cargando análisis...</span>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          {projectMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{projectMetrics.completion_percentage.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Progreso Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{projectMetrics.completed_activities}</p>
                      <p className="text-xs text-muted-foreground">Completadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{projectMetrics.average_daily_progress.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Promedio Diario</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      projectMetrics.risk_level === 'low' ? 'bg-green-100' :
                      projectMetrics.risk_level === 'medium' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <AlertTriangle className={`h-5 w-5 ${
                        projectMetrics.risk_level === 'low' ? 'text-green-600' :
                        projectMetrics.risk_level === 'medium' ? 'text-yellow-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold capitalize">{projectMetrics.risk_level}</p>
                      <p className="text-xs text-muted-foreground">Nivel de Riesgo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Analytics */}
          <Card>
            <Tabs defaultValue="trends" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="trends">Tendencias</TabsTrigger>
                <TabsTrigger value="performance">Rendimiento</TabsTrigger>
                <TabsTrigger value="predictions">Predicciones</TabsTrigger>
                <TabsTrigger value="risks">Riesgos</TabsTrigger>
              </TabsList>

              <TabsContent value="trends" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Progreso Diario</h3>
                    {activityTrends && activityTrends.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={activityTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(value) => new Date(value).toLocaleDateString()}
                            />
                            <YAxis />
                            <Tooltip 
                              labelFormatter={(value) => new Date(value).toLocaleDateString()}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="progress" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              name="Progreso"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No hay datos de tendencias disponibles</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="mt-6">
                <div className="space-y-6">
                  {performanceMetrics && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Zap className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold">{performanceMetrics.productivity_score.toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">Productividad</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold">{performanceMetrics.quality_score.toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">Calidad</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Activity className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold">{performanceMetrics.efficiency_ratio.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">Eficiencia</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Rendimiento del Equipo</h3>
                        <div className="space-y-3">
                          {performanceMetrics.team_performance.map((member) => (
                            <Card key={member.user_id}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                      <Users className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{member.user_name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {member.reports_count} reportes
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <p className="text-sm font-medium">{member.average_progress.toFixed(1)}</p>
                                      <p className="text-xs text-muted-foreground">Promedio</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium">{member.quality_score.toFixed(1)}</p>
                                      <p className="text-xs text-muted-foreground">Calidad</p>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="predictions" className="mt-6">
                <div className="space-y-6">
                  {predictiveData && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Calendar className="h-5 w-5" />
                              Predicción de Finalización
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-muted-foreground">Fecha Estimada</p>
                                <p className="text-2xl font-bold">
                                  {new Date(predictiveData.forecasted_completion).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Nivel de Confianza</p>
                                <div className="flex items-center gap-2">
                                  <Progress value={predictiveData.confidence_level} className="flex-1" />
                                  <span className="text-sm font-medium">{predictiveData.confidence_level.toFixed(0)}%</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Target className="h-5 w-5" />
                              Recomendaciones
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {predictiveData.recommendations.map((recommendation, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <p className="text-sm">{recommendation}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="risks" className="mt-6">
                <div className="space-y-6">
                  {predictiveData && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5" />
                              Factores de Riesgo
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {predictiveData.risk_factors.length > 0 ? (
                              <div className="space-y-2">
                                {predictiveData.risk_factors.map((factor, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">{factor}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">No se identificaron factores de riesgo</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Clock className="h-5 w-5" />
                              Estado del Proyecto
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Progreso Actual</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Progress value={projectMetrics?.completion_percentage || 0} className="flex-1" />
                                  <span className="text-sm font-medium">{projectMetrics?.completion_percentage.toFixed(1)}%</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Nivel de Riesgo</p>
                                <Badge 
                                  variant={
                                    projectMetrics?.risk_level === 'low' ? 'default' :
                                    projectMetrics?.risk_level === 'medium' ? 'secondary' : 'destructive'
                                  }
                                  className="mt-1"
                                >
                                  {projectMetrics?.risk_level}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </>
      )}
    </div>
  );
}