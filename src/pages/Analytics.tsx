import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, TrendingDown, Calendar, Target, AlertCircle, Database } from "lucide-react";
import { useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [selectedSystem, setSelectedSystem] = useState("all");
  
  const { 
    overallKPIs, 
    systemAnalytics, 
    progressData: weeklyProgress,
    projects,
    isLoading 
  } = useAnalytics();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 animate-spin" />
            <span>Cargando datos desde Supabase...</span>
          </div>
        </div>
      </div>
    );
  }

  // Use real data with fallback to mock data
  const kpiData = {
    plannedProgress: overallKPIs.plannedProgress || 75,
    actualProgress: overallKPIs.actualProgress || 67,
    efficiency: overallKPIs.efficiency || 89.3,
    onTimeActivities: overallKPIs.completedActivities || 156,
    delayedActivities: (overallKPIs.totalActivities - overallKPIs.completedActivities) || 23,
    totalActivities: overallKPIs.totalActivities || 179
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analítica</h1>
          <p className="text-muted-foreground">Análisis detallado del rendimiento del proyecto</p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Rango Personalizado
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="construction-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso vs Plan</CardTitle>
            <Target className="h-4 w-4 text-chart-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpiData.actualProgress}% / {kpiData.plannedProgress}%
            </div>
            <Progress value={kpiData.actualProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {kpiData.actualProgress - kpiData.plannedProgress < 0 ? "Retraso" : "Adelanto"} de{" "}
              {Math.abs(kpiData.actualProgress - kpiData.plannedProgress)}%
            </p>
          </CardContent>
        </Card>

        <Card className="construction-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia Global</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.efficiency}%</div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="h-4 w-4 text-chart-success" />
              <span className="text-sm text-chart-success">+2.3% vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="construction-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividades a Tiempo</CardTitle>
            <BarChart3 className="h-4 w-4 text-chart-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.onTimeActivities}</div>
            <p className="text-xs text-muted-foreground">
              de {kpiData.totalActivities} actividades totales
            </p>
          </CardContent>
        </Card>

        <Card className="construction-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividades Retrasadas</CardTitle>
            <AlertCircle className="h-4 w-4 text-chart-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-danger">{kpiData.delayedActivities}</div>
            <p className="text-xs text-muted-foreground">
              {((kpiData.delayedActivities / kpiData.totalActivities) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Performance */}
        <Card className="construction-card">
          <CardHeader>
            <CardTitle>Rendimiento por Sistema</CardTitle>
            <CardDescription>Análisis de eficiencia y cumplimiento por sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemAnalytics.map((system) => (
              <div key={system.name} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{system.name}</span>
                  <div className="flex items-center gap-2">
                    {system.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-chart-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-chart-danger" />
                    )}
                    <Badge 
                      variant={system.efficiency >= 95 ? "default" : system.efficiency >= 80 ? "secondary" : "destructive"}
                    >
                      {Math.round(system.efficiency)}%
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Planificado</p>
                    <p className="font-mono">{Math.round(system.planned)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Real</p>
                    <p className="font-mono">{Math.round(system.actual)}%</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Actividades completadas</span>
                  <span className="font-mono">{system.completedActivities}/{system.activities}</span>
                </div>
                
                <Progress value={(system.completedActivities / system.activities) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* S-Curve Chart */}
        <Card className="construction-card">
          <CardHeader>
            <CardTitle>Curva S: Plan vs Real</CardTitle>
            <CardDescription>Comparación de progreso acumulativo a lo largo del tiempo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, name === 'planned' ? 'Planificado' : 'Real']}
                    labelFormatter={(label) => `Semana: ${label}`}
                  />
                  <Legend 
                    formatter={(value) => value === 'planned' ? 'Planificado' : 'Real'}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="planned" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="planned"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={3}
                    name="actual"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Datos del Proyecto</h4>
                  <p><strong>Proyecto:</strong> Planta de Procesamiento de Gas San Martín</p>
                  <p><strong>Fecha inicio:</strong> 02/01/2024</p>
                  <p><strong>Progreso actual:</strong> {weeklyProgress[weeklyProgress.length - 1].actual}%</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Estado Actual</h4>
                  <p><strong>Desfase:</strong> {(weeklyProgress[weeklyProgress.length - 1].planned - weeklyProgress[weeklyProgress.length - 1].actual).toFixed(1)}%</p>
                  <p><strong>Tendencia:</strong> {weeklyProgress[weeklyProgress.length - 1].actual > weeklyProgress[weeklyProgress.length - 2].actual ? 'Mejorando' : 'Estable'}</p>
                  <p><strong>Proyección:</strong> En seguimiento</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card className="construction-card">
        <CardHeader>
          <CardTitle>Métricas Detalladas</CardTitle>
          <CardDescription>Indicadores clave de rendimiento del proyecto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Productividad</h4>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-sm text-muted-foreground">vs. 89.1% mes anterior</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Calidad</h4>
              <div className="text-2xl font-bold">96.8%</div>
              <p className="text-sm text-muted-foreground">Tasa de aprobación</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Tiempo Promedio</h4>
              <div className="text-2xl font-bold">2.3h</div>
              <p className="text-sm text-muted-foreground">Por aprobación de reporte</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}