import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  FileText, 
  BarChart3,
  Wrench,
  Target,
  Shield,
  Settings,
  Loader2,
  Calendar,
  Activity
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useProject } from "@/contexts/ProjectContext";
import { useDashboard } from "@/hooks/useDashboard";
import { Link } from "react-router-dom";

interface DashboardWidget {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color: 'default' | 'success' | 'warning' | 'destructive';
  trend?: number;
  link?: string;
}

export function RoleDashboard() {
  const { profile } = useProfile();
  const { selectedProject } = useProject();
  const userRole = profile?.role || 'reporter';

  const {
    dashboardMetrics,
    projectSummaries,
    recentActivities,
    teamPerformance,
    metricsLoading,
    projectsLoading,
    activitiesLoading,
    teamLoading
  } = useDashboard();

  const supervisorWidgets: DashboardWidget[] = [
    {
      id: 'projects',
      title: 'Proyectos Activos',
      value: dashboardMetrics?.active_projects || 0,
      subtitle: `${dashboardMetrics?.total_projects || 0} total`,
      icon: Building2,
      color: 'default',
      link: '/projects'
    },
    {
      id: 'progress',
      title: 'Progreso General',
      value: `${((dashboardMetrics?.completed_activities || 0) / Math.max(dashboardMetrics?.total_activities || 1, 1) * 100).toFixed(1)}%`,
      subtitle: 'Del proyecto total',
      icon: TrendingUp,
      color: 'success',
      trend: 5
    },
    {
      id: 'critical',
      title: 'Reportes Pendientes',
      value: dashboardMetrics?.pending_reports || 0,
      subtitle: 'Requieren aprobación',
      icon: AlertTriangle,
      color: 'warning',
      link: '/approve'
    },
    {
      id: 'team',
      title: 'Miembros del Equipo',
      value: dashboardMetrics?.team_members || 0,
      subtitle: 'Usuarios activos',
      icon: Users,
      color: 'default'
    }
  ];

  const reporterWidgets: DashboardWidget[] = [
    {
      id: 'my-progress',
      title: 'Mi Progreso',
      value: '85%',
      subtitle: 'Esta semana',
      icon: TrendingUp,
      color: 'success',
      link: '/capture'
    },
    {
      id: 'pending-tasks',
      title: 'Tareas Pendientes',
      value: 3,
      subtitle: 'Para hoy',
      icon: Clock,
      color: 'warning',
      link: '/capture'
    },
    {
      id: 'reports-sent',
      title: 'Reportes Enviados',
      value: dashboardMetrics?.approved_reports || 0,
      subtitle: 'Este mes',
      icon: FileText,
      color: 'default'
    },
    {
      id: 'project-status',
      title: 'Estado del Proyecto',
      value: selectedProject ? 'Activo' : 'Sin Proyecto',
      subtitle: selectedProject?.name || 'Selecciona un proyecto',
      icon: Target,
      color: selectedProject ? 'success' : 'warning',
      link: '/projects'
    }
  ];

  const executiveWidgets: DashboardWidget[] = [
    {
      id: 'portfolio',
      title: 'Portfolio de Proyectos',
      value: dashboardMetrics?.total_projects || 0,
      subtitle: `${dashboardMetrics?.active_projects || 0} activos`,
      icon: Building2,
      color: 'default',
      link: '/executive'
    },
    {
      id: 'overall-progress',
      title: 'Progreso General',
      value: `${((dashboardMetrics?.completed_activities || 0) / Math.max(dashboardMetrics?.total_activities || 1, 1) * 100).toFixed(1)}%`,
      subtitle: 'Todos los proyectos',
      icon: BarChart3,
      color: 'success',
      link: '/analytics'
    },
    {
      id: 'team-performance',
      title: 'Rendimiento del Equipo',
      value: '92%',
      subtitle: 'Eficiencia promedio',
      icon: Users,
      color: 'success',
      link: '/analytics'
    },
    {
      id: 'risk-level',
      title: 'Nivel de Riesgo',
      value: 'Bajo',
      subtitle: 'Portfolio estable',
      icon: Shield,
      color: 'success'
    }
  ];

  const getWidgetsForRole = () => {
    switch (userRole) {
      case 'supervisor':
        return supervisorWidgets;
      case 'executive':
        return executiveWidgets;
      default:
        return reporterWidgets;
    }
  };

  const widgets = getWidgetsForRole();

  const isLoading = metricsLoading || projectsLoading || activitiesLoading || teamLoading;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            ¡Hola, {profile?.full_name || profile?.email || 'Usuario'}!
          </h1>
          <p className="text-muted-foreground">
            {userRole === 'supervisor' && 'Panel de supervisión - Gestiona proyectos y equipos'}
            {userRole === 'executive' && 'Panel ejecutivo - Vista general del portfolio'}
            {userRole === 'reporter' && 'Panel de reportes - Captura tu progreso diario'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {userRole === 'supervisor' && 'Supervisor'}
            {userRole === 'executive' && 'Ejecutivo'}
            {userRole === 'reporter' && 'Reportante'}
          </Badge>
          {selectedProject && (
            <Badge variant="secondary" className="text-sm">
              {selectedProject.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          widgets.map((widget) => {
            const Icon = widget.icon;
            return (
              <Card key={widget.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {widget.title}
                      </p>
                      <p className="text-2xl font-bold">{widget.value}</p>
                      {widget.subtitle && (
                        <p className="text-xs text-muted-foreground">
                          {widget.subtitle}
                        </p>
                      )}
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      widget.color === 'success' ? 'bg-green-100' :
                      widget.color === 'warning' ? 'bg-yellow-100' :
                      widget.color === 'destructive' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        widget.color === 'success' ? 'text-green-600' :
                        widget.color === 'warning' ? 'text-yellow-600' :
                        widget.color === 'destructive' ? 'text-red-600' : 'text-blue-600'
                      }`} />
                    </div>
                  </div>
                  {widget.trend && (
                    <div className="mt-4">
                      <div className="flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-green-600">+{widget.trend}%</span>
                        <span className="text-muted-foreground ml-1">vs mes anterior</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Proyectos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : projectSummaries && projectSummaries.length > 0 ? (
              <div className="space-y-4">
                {projectSummaries.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{project.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {project.code}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {project.completed_activities} de {project.total_activities} actividades
                      </p>
                      <div className="mt-2">
                        <Progress value={project.progress_percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {project.progress_percentage.toFixed(1)}% completado
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={
                          project.status === 'active' ? 'default' :
                          project.status === 'completed' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No hay proyectos disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentActivities && recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'report' ? 'bg-blue-100' :
                      activity.type === 'approval' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {activity.type === 'report' && <FileText className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'approval' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.user_name} • {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No hay actividad reciente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userRole === 'reporter' && (
              <>
                <Button asChild className="h-20 flex-col gap-2">
                  <Link to="/capture">
                    <Wrench className="h-6 w-6" />
                    <span>Capturar Avance</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link to="/import">
                    <FileText className="h-6 w-6" />
                    <span>Importar Plan</span>
                  </Link>
                </Button>
              </>
            )}
            {userRole === 'supervisor' && (
              <>
                <Button asChild className="h-20 flex-col gap-2">
                  <Link to="/approve">
                    <CheckCircle className="h-6 w-6" />
                    <span>Aprobar Reportes</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link to="/reports">
                    <BarChart3 className="h-6 w-6" />
                    <span>Ver Reportes</span>
                  </Link>
                </Button>
              </>
            )}
            {userRole === 'executive' && (
              <>
                <Button asChild className="h-20 flex-col gap-2">
                  <Link to="/executive">
                    <Building2 className="h-6 w-6" />
                    <span>Dashboard Ejecutivo</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link to="/analytics">
                    <TrendingUp className="h-6 w-6" />
                    <span>Análisis</span>
                  </Link>
                </Button>
              </>
            )}
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link to="/whatsapp">
                <FileText className="h-6 w-6" />
                <span>WhatsApp</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link to="/settings">
                <Settings className="h-6 w-6" />
                <span>Configuración</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}