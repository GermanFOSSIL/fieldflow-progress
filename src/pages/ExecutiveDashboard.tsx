import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell 
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MapPin,
  Calendar,
  MessageSquare,
  Activity,
  Target,
  Zap,
  FileText
} from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Sample data for charts - keeping existing data structure
const progressData = [
  { name: 'Ene', planned: 65, actual: 58 },
  { name: 'Feb', planned: 70, actual: 72 },
  { name: 'Mar', planned: 75, actual: 69 },
  { name: 'Abr', planned: 80, actual: 78 },
  { name: 'May', planned: 85, actual: 81 },
  { name: 'Jun', planned: 90, actual: 85 },
];

const activitiesData = [
  { name: 'Estructura', value: 35, color: '#8b5cf6' },
  { name: 'Electricidad', value: 25, color: '#06b6d4' },
  { name: 'Plomería', value: 20, color: '#84cc16' },
  { name: 'Acabados', value: 20, color: '#f59e0b' },
];

export default function ExecutiveDashboard() {
  const { selectedProject } = useProject();

  // Fetch real project statistics
  const { data: projectStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['project-stats', selectedProject?.id],
    queryFn: async () => {
      if (!selectedProject?.id) return null;

      const [
        { data: activities },
        { data: reports },
        { data: progress },
        { data: contacts }
      ] = await Promise.all([
        supabase.from('activities').select('*').limit(1000),
        supabase.from('daily_reports').select('*').eq('project_id', selectedProject.id).limit(1000),
        supabase.from('activity_progress_agg').select('*').limit(1000),
        supabase.from('whatsapp_contacts').select('*').eq('is_active', true).limit(1000)
      ]);

      return {
        totalActivities: activities?.length || 0,
        totalReports: reports?.length || 0,
        pendingReports: reports?.filter(r => r.status === 'sent').length || 0,
        approvedReports: reports?.filter(r => r.status === 'approved').length || 0,
        averageProgress: progress?.reduce((acc, p) => acc + (p.pct || 0), 0) / (progress?.length || 1) * 100,
        totalContacts: contacts?.length || 0,
        activeContacts: contacts?.filter(c => c.is_active).length || 0,
      };
    },
    enabled: !!selectedProject?.id,
    refetchInterval: 30000,
  });

  const kpis = [
    {
      title: "Avance General",
      value: `${Math.round(projectStats?.averageProgress || 0)}%`,
      change: "+2.1%",
      trend: "up",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Reportes Pendientes",
      value: projectStats?.pendingReports?.toString() || "0",
      change: "-12%",
      trend: "down", 
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Actividades Totales",
      value: projectStats?.totalActivities?.toString() || "0",
      change: "+5.2%",
      trend: "up",
      icon: Activity,
      color: "text-blue-600", 
      bgColor: "bg-blue-50",
    },
    {
      title: "Contactos WhatsApp",
      value: projectStats?.activeContacts?.toString() || "0",
      change: "+3.1%",
      trend: "up",
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  if (!selectedProject) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Selecciona un proyecto</h3>
          <p className="text-muted-foreground">
            Elige un proyecto para ver el dashboard ejecutivo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Ejecutivo</h1>
          <p className="text-muted-foreground">
            Proyecto: {selectedProject.name} ({selectedProject.code})
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Última actualización: {new Date().toLocaleDateString()}
          </Badge>
          <Button variant="outline" size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <div className="flex items-center mt-1">
                    {kpi.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm ${
                      kpi.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="progress">Avance de Obra</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Avance vs Planificado</CardTitle>
                <CardDescription>
                  Comparación mensual del avance real vs planificado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="planned" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Planificado"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      name="Real"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Activities Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Actividades</CardTitle>
                <CardDescription>
                  Porcentaje de actividades por especialidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={activitiesData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {activitiesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Avance Detallado por Actividad</CardTitle>
              <CardDescription>
                Estado actual de las principales actividades del proyecto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { name: "Estructura Torre A - Nivel 1-3", progress: 100, status: "completed" },
                  { name: "Estructura Torre A - Nivel 4-6", progress: 85, status: "in-progress" },
                  { name: "Instalaciones Eléctricas - Torre A", progress: 60, status: "in-progress" },
                  { name: "Plomería - Torre A", progress: 45, status: "in-progress" },
                  { name: "Estructura Torre B - Nivel 1-2", progress: 75, status: "in-progress" },
                  { name: "Acabados - Torre A Nivel 1", progress: 25, status: "in-progress" },
                ].map((activity, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{activity.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{activity.progress}%</span>
                        <Badge 
                          variant={activity.status === "completed" ? "default" : "secondary"}
                        >
                          {activity.status === "completed" ? "Completada" : "En progreso"}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={activity.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Reportes</p>
                    <p className="text-2xl font-bold">{projectStats?.totalReports || 0}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-50">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Aprobados</p>
                    <p className="text-2xl font-bold">{projectStats?.approvedReports || 0}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-50">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                    <p className="text-2xl font-bold">{projectStats?.pendingReports || 0}</p>
                  </div>
                  <div className="p-3 rounded-full bg-orange-50">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
