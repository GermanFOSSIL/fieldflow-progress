import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
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
  Settings
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useProject } from "@/contexts/ProjectContext";

interface DashboardWidget {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color: 'default' | 'success' | 'warning' | 'destructive';
  trend?: number;
}

export function RoleDashboard() {
  const { profile } = useProfile();
  const { selectedProject } = useProject();
  const userRole = profile?.role || 'reporter';

  const supervisorWidgets: DashboardWidget[] = [
    {
      id: 'progress',
      title: 'Progreso General',
      value: '68%',
      subtitle: 'Del proyecto total',
      icon: TrendingUp,
      color: 'success',
      trend: 5
    },
    {
      id: 'critical',
      title: 'Alertas Críticas',
      value: 3,
      subtitle: 'Requieren atención inmediata',
      icon: AlertTriangle,
      color: 'destructive'
    },
    {
      id: 'approvals',
      title: 'Aprobaciones Pendientes',
      value: 12,
      subtitle: 'Reportes por revisar',
      icon: Clock,
      color: 'warning'
    },
    {
      id: 'team',
      title: 'Equipo Activo',
      value: 24,
      subtitle: 'Trabajadores en campo',
      icon: Users,
      color: 'default'
    }
  ];

  const reporterWidgets: DashboardWidget[] = [
    {
      id: 'my-tasks',
      title: 'Mis Tareas',
      value: 8,
      subtitle: 'Asignadas para hoy',
      icon: Target,
      color: 'default'
    },
    {
      id: 'completed',
      title: 'Completadas',
      value: 15,
      subtitle: 'Esta semana',
      icon: CheckCircle,
      color: 'success'
    },
    {
      id: 'progress',
      title: 'Mi Progreso',
      value: '85%',
      subtitle: 'Objetivos del mes',
      icon: TrendingUp,
      color: 'success',
      trend: 12
    },
    {
      id: 'quality',
      title: 'Calidad Promedio',
      value: '9.2',
      subtitle: 'Score de mis reportes',
      icon: Shield,
      color: 'success'
    }
  ];

  const adminWidgets: DashboardWidget[] = [
    {
      id: 'projects',
      title: 'Proyectos Activos',
      value: 7,
      subtitle: 'En desarrollo',
      icon: Building2,
      color: 'default'
    },
    {
      id: 'users',
      title: 'Usuarios Activos',
      value: 156,
      subtitle: 'Últimas 24h',
      icon: Users,
      color: 'success'
    },
    {
      id: 'system',
      title: 'Estado del Sistema',
      value: '99.8%',
      subtitle: 'Uptime',
      icon: Settings,
      color: 'success'
    },
    {
      id: 'reports',
      title: 'Reportes Generados',
      value: 1247,
      subtitle: 'Este mes',
      icon: BarChart3,
      color: 'default'
    }
  ];

  const getWidgetsByRole = () => {
    switch (userRole) {
      case 'supervisor': return supervisorWidgets;
      default: return reporterWidgets;
    }
  };

  const widgets = getWidgetsByRole();

  const getQuickActions = () => {
    switch (userRole) {
      case 'supervisor':
        return [
          { label: 'Revisar Aprobaciones', action: '/approve', color: 'default' },
          { label: 'Generar Reporte', action: '/reports', color: 'outline' },
          { label: 'Ver Analytics', action: '/analytics', color: 'outline' }
        ];
      default:
        return [
          { label: 'Capturar Progreso', action: '/capture', color: 'default' },
          { label: 'WhatsApp Bot', action: '/whatsapp', color: 'outline' },
          { label: 'Mis Reportes', action: '/reports', color: 'outline' }
        ];
    }
  };

  const quickActions = getQuickActions();

  return (
    <div className="space-y-6">
      {/* Role-specific header */}
      <div className="flex items-center justify-between">
        <div>
        <h2 className="text-2xl font-bold">
          Dashboard {userRole === 'supervisor' ? 'Supervisor' : 'Reporter'}
        </h2>
          <p className="text-muted-foreground">
            {selectedProject ? `Proyecto: ${selectedProject.name}` : 'Selecciona un proyecto'}
          </p>
        </div>
        <Badge variant="outline" className="capitalize">
          {userRole}
        </Badge>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgets.map((widget) => (
          <Card key={widget.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
              <widget.icon className={`h-4 w-4 ${
                widget.color === 'success' ? 'text-green-600' :
                widget.color === 'warning' ? 'text-yellow-600' :
                widget.color === 'destructive' ? 'text-red-600' :
                'text-muted-foreground'
              }`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{widget.value}</div>
              {widget.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">
                  {widget.subtitle}
                </p>
              )}
              {widget.trend && (
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+{widget.trend}%</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {quickActions.map((action, index) => (
            <Button 
              key={index}
              variant={action.color as any}
              onClick={() => window.location.href = action.action}
            >
              {action.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Real-time Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actividad en Tiempo Real</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 bg-muted/30 rounded">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Sistema de instrumentación actualizado</p>
                <p className="text-xs text-muted-foreground">Hace 5 minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-muted/30 rounded">
              <Wrench className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Soldadura completada en Sector A</p>
                <p className="text-xs text-muted-foreground">Hace 12 minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-muted/30 rounded">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Retraso detectado en tubería principal</p>
                <p className="text-xs text-muted-foreground">Hace 25 minutos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}