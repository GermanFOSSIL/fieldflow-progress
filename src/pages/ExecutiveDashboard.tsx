import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Users,
  Activity,
  BarChart3,
  Calendar,
  MapPin
} from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Bar, BarChart } from "recharts";

export default function ExecutiveDashboard() {
  const { selectedProject } = useProject();
  const { overallKPIs, systemAnalytics, progressData, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Project Context */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Ejecutivo</h1>
          <p className="text-muted-foreground">
            Métricas en tiempo real del proyecto {selectedProject?.name || "Ningún proyecto seleccionado"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Activity className="w-3 h-3 mr-1" />
            En línea
          </Badge>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Último reporte: Hoy
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Progreso General</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{overallKPIs.actualProgress.toFixed(1)}%</div>
            <Progress value={overallKPIs.actualProgress} className="mt-2 h-2" />
            <p className="text-xs text-blue-600 mt-1">
              +2.1% desde la semana pasada
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Eficiencia</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{overallKPIs.efficiency.toFixed(1)}%</div>
            <p className="text-xs text-green-600 mt-1">
              Por encima del objetivo
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Actividades</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {overallKPIs.completedActivities}/{overallKPIs.totalActivities}
            </div>
            <Progress 
              value={(overallKPIs.completedActivities / overallKPIs.totalActivities) * 100} 
              className="mt-2 h-2" 
            />
            <p className="text-xs text-orange-600 mt-1">
              {overallKPIs.totalActivities - overallKPIs.completedActivities} pendientes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">3</div>
            <p className="text-xs text-purple-600 mt-1">
              2 críticas, 1 moderada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Progress Curve */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Curva de Progreso (S-Curve)
            </CardTitle>
            <CardDescription>Progreso planificado vs. real</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="planned" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5"
                  name="Planificado"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Real"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Rendimiento por Sistema
            </CardTitle>
            <CardDescription>Eficiencia de cada sistema constructivo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={systemAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="efficiency" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Actividad en Tiempo Real
          </CardTitle>
          <CardDescription>Últimos eventos del proyecto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                time: "Hace 5 min",
                user: "Carlos Mendez",
                action: "Reportó avance en Estructura - Torre A",
                progress: "85% completado",
                type: "progress"
              },
              {
                time: "Hace 12 min",
                user: "Ana López",
                action: "Aprobó reporte de excavación",
                progress: "12 actividades",
                type: "approval"
              },
              {
                time: "Hace 25 min",
                user: "Sistema",
                action: "Alerta: Retraso en instalaciones",
                progress: "2 días de atraso",
                type: "alert"
              },
              {
                time: "Hace 1 hora",
                user: "Miguel Torres",
                action: "Subió fotos de avance vía WhatsApp",
                progress: "8 imágenes",
                type: "whatsapp"
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0">
                  {activity.type === 'progress' && <TrendingUp className="h-4 w-4 text-green-600" />}
                  {activity.type === 'approval' && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                  {activity.type === 'alert' && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                  {activity.type === 'whatsapp' && <MapPin className="h-4 w-4 text-purple-600" />}
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.user} • {activity.time}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.progress}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}