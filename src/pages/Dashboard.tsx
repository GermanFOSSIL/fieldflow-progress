import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react";

export default function Dashboard() {
  // Mock data for demo
  const projectSummary = {
    totalProgress: 67,
    plannedProgress: 75,
    activeActivities: 156,
    completedActivities: 89,
    pendingApprovals: 12
  };

  const systemProgress = [
    { name: "Sistema Proceso", progress: 78, status: "on-track" },
    { name: "Sistema Eléctrico", progress: 45, status: "delayed" },
    { name: "Sistema Instrumentos", progress: 91, status: "ahead" },
    { name: "Piping Rack", progress: 62, status: "on-track" },
  ];

  const topDelays = [
    { activity: "A-0120 Tendido cable 6mm2", variance: -15, unit: "m" },
    { activity: "A-0002 Soportes tubería", variance: -8, unit: "m" },
    { activity: "A-0101 Tendido bandeja principal", variance: -5, unit: "m" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel del Proyecto</h1>
          <p className="text-muted-foreground">FieldProgress Demo - Resumen de Progreso de Construcción</p>
        </div>
        <Button variant="default" className="bg-primary text-white">
          <FileText className="mr-2 h-4 w-4" />
          Generar Reporte
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="construction-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso General</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectSummary.totalProgress}%</div>
            <Progress value={projectSummary.totalProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Plan: {projectSummary.plannedProgress}% ({projectSummary.plannedProgress - projectSummary.totalProgress}% varianza)
            </p>
          </CardContent>
        </Card>

        <Card className="construction-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividades Activas</CardTitle>
            <Clock className="h-4 w-4 text-chart-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectSummary.activeActivities}</div>
            <p className="text-xs text-muted-foreground">
              {projectSummary.completedActivities} completadas
            </p>
          </CardContent>
        </Card>

        <Card className="construction-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes de Aprobación</CardTitle>
            <AlertTriangle className="h-4 w-4 text-chart-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectSummary.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Requiere revisión del supervisor
            </p>
          </CardContent>
        </Card>

        <Card className="construction-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntuación de Calidad</CardTitle>
            <CheckCircle className="h-4 w-4 text-chart-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              Tasa de aprobación esta semana
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Progress */}
        <Card className="construction-card">
          <CardHeader>
            <CardTitle>Progreso por Sistema</CardTitle>
            <CardDescription>Estado actual de finalización por sistema de construcción</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemProgress.map((system) => (
              <div key={system.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{system.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{system.progress}%</span>
                    <Badge 
                      variant={
                        system.status === "ahead" ? "default" :
                        system.status === "delayed" ? "destructive" : "secondary"
                      }
                      className="text-xs"
                    >
                      {system.status === "ahead" ? "Adelantado" :
                       system.status === "delayed" ? "Atrasado" : "En Tiempo"}
                    </Badge>
                  </div>
                </div>
                <Progress value={system.progress} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Delays */}
        <Card className="construction-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              Top Atrasos
            </CardTitle>
            <CardDescription>Actividades con mayor varianza del plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDelays.map((delay, index) => (
                <div key={delay.activity} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{delay.activity}</p>
                    <p className="text-xs text-muted-foreground">
                      Fuera de cronograma
                    </p>
                  </div>
                  <Badge variant="destructive" className="font-mono">
                    {delay.variance}% {delay.unit}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* S-Curve Placeholder */}
      <Card className="construction-card">
        <CardHeader>
          <CardTitle>Curva S: Plan vs Real</CardTitle>
          <CardDescription>Comparación de progreso acumulativo a lo largo del tiempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground">Gráfico Curva S</p>
              <p className="text-sm text-muted-foreground">Se conectará con datos de Supabase</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}