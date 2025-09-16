import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, TrendingDown, Calendar, Target, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [selectedSystem, setSelectedSystem] = useState("all");

  // Mock data para analítica
  const kpiData = {
    plannedProgress: 75,
    actualProgress: 67,
    efficiency: 89.3,
    onTimeActivities: 156,
    delayedActivities: 23,
    totalActivities: 179
  };

  const systemAnalytics = [
    {
      name: "Sistema Tuberías",
      planned: 80,
      actual: 78,
      efficiency: 97.5,
      trend: "up",
      activitiesCompleted: 45,
      activitiesTotal: 58
    },
    {
      name: "Sistema Instrumentos", 
      planned: 60,
      actual: 45,
      efficiency: 75.0,
      trend: "down",
      activitiesCompleted: 23,
      activitiesTotal: 48
    },
    {
      name: "Sistema Eléctrico",
      planned: 85,
      actual: 91,
      efficiency: 107.1,
      trend: "up",
      activitiesCompleted: 34,
      activitiesTotal: 37
    },
    {
      name: "Facilidades Superficie",
      planned: 70,
      actual: 62,
      efficiency: 88.6,
      trend: "down",
      activitiesCompleted: 18,
      activitiesTotal: 36
    }
  ];

  const weeklyProgress = [
    { week: "Sem 1", planned: 3.2, actual: 2.8 },
    { week: "Sem 2", planned: 6.8, actual: 6.1 },
    { week: "Sem 3", planned: 11.5, actual: 10.9 },
    { week: "Sem 4", planned: 17.2, actual: 16.8 },
    { week: "Sem 5", planned: 23.8, actual: 23.2 },
    { week: "Sem 6", planned: 31.1, actual: 29.7 }
  ];

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
                      {system.efficiency}%
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Planificado</p>
                    <p className="font-mono">{system.planned}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Real</p>
                    <p className="font-mono">{system.actual}%</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Actividades completadas</span>
                  <span className="font-mono">{system.activitiesCompleted}/{system.activitiesTotal}</span>
                </div>
                
                <Progress value={(system.activitiesCompleted / system.activitiesTotal) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Progress Chart */}
        <Card className="construction-card">
          <CardHeader>
            <CardTitle>Curva S - Progreso Semanal</CardTitle>
            <CardDescription>Comparación entre progreso planificado y real</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyProgress.map((week, index) => (
                <div key={week.week} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{week.week}</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-chart-primary">Plan: {week.planned}%</span>
                      <span className="text-chart-secondary">Real: {week.actual}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-chart-primary rounded-full"></div>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-chart-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${week.planned}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-chart-secondary rounded-full"></div>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-chart-secondary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${week.actual}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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