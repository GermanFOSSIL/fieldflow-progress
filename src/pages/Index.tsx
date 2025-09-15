import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Construction, 
  FileSpreadsheet, 
  Camera, 
  CheckCircle, 
  BarChart3, 
  FileText,
  ArrowRight,
  HardHat,
  Database
} from "lucide-react";
import { Link } from "react-router-dom";
import { insertSeedData } from "@/lib/seed-data";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Index() {
  const { toast } = useToast();
  const [loadingSeeds, setLoadingSeeds] = useState(false);

  // Mock project stats
  const stats = {
    totalProjects: 3,
    activeProjects: 2,
    completedActivities: 1250,
    totalActivities: 2100,
    overallProgress: 67
  };

  const quickActions = [
    {
      title: "Capturar Progreso",
      description: "Registrar avance diario de actividades",
      icon: Camera,
      href: "/capture",
      color: "bg-chart-1"
    },
    {
      title: "Dashboard",
      description: "Ver resumen del proyecto",
      icon: BarChart3,
      href: "/dashboard",
      color: "bg-chart-2"
    },
    {
      title: "Importar Plan",
      description: "Subir estructura WBS desde CSV",
      icon: FileSpreadsheet,
      href: "/import",
      color: "bg-chart-3"
    },
    {
      title: "Aprobar Reportes",
      description: "Validar partes diarios",
      icon: CheckCircle,
      href: "/approve",
      color: "bg-chart-4"
    }
  ];

  const handleInsertSeedData = async () => {
    setLoadingSeeds(true);
    try {
      const result = await insertSeedData();
      if (result.success) {
        toast({
          title: "Datos de prueba insertados",
          description: "Se ha creado el proyecto demo con actividades de ejemplo",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudieron insertar los datos de prueba",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al insertar los datos",
        variant: "destructive"
      });
    } finally {
      setLoadingSeeds(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-industrial-gradient p-4 rounded-xl">
            <HardHat className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground">
          FieldProgress
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Sistema integral de control y seguimiento de avance de obra para proyectos de ingeniería
        </p>
        
        {/* Botón para insertar datos de prueba */}
        <div className="mt-6">
          <Button 
            onClick={handleInsertSeedData}
            disabled={loadingSeeds}
            variant="outline"
            className="gap-2"
          >
            <Database className="h-4 w-4" />
            {loadingSeeds ? "Insertando..." : "Cargar Datos de Prueba"}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="construction-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Totales</CardTitle>
            <Construction className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProjects} activos
            </p>
          </CardContent>
        </Card>

        <Card className="construction-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividades</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedActivities}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalActivities} completadas
            </p>
          </CardContent>
        </Card>

        <Card className="construction-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso General</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overallProgress}%</div>
            <Progress value={stats.overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="construction-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            <CheckCircle className="h-4 w-4 text-chart-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-success">En Tiempo</div>
            <p className="text-xs text-muted-foreground">
              Según planificación
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <Card key={action.title} className="construction-card hover:shadow-lg transition-shadow cursor-pointer group">
              <Link to={action.href}>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                  <div className="flex items-center text-primary group-hover:text-primary/80">
                    <span className="text-sm font-medium">Ir a módulo</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="construction-card">
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimos eventos en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
              <div className="bg-chart-success p-2 rounded-full">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Reporte diario aprobado</p>
                <p className="text-xs text-muted-foreground">Proyecto FP01 - Turno Día - hace 2 horas</p>
              </div>
              <Badge variant="default">Aprobado</Badge>
            </div>
            
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
              <div className="bg-chart-primary p-2 rounded-full">
                <Camera className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Progreso capturado</p>
                <p className="text-xs text-muted-foreground">15 actividades actualizadas - hace 4 horas</p>
              </div>
              <Badge variant="secondary">Enviado</Badge>
            </div>
            
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
              <div className="bg-chart-warning p-2 rounded-full">
                <FileSpreadsheet className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Plan importado</p>
                <p className="text-xs text-muted-foreground">250 actividades nuevas - ayer</p>
              </div>
              <Badge variant="outline">Completado</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
