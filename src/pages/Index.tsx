import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Database,
  Clock,
  Shield,
  Smartphone,
  TrendingUp,
  Users,
  Target,
  Zap,
  Award,
  CheckSquare,
  MapPin,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8 bg-gradient-to-b from-muted/30 to-background py-16 -mx-6 px-6 rounded-2xl">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-industrial-gradient p-6 rounded-2xl shadow-lg">
            <HardHat className="h-16 w-16 text-white" />
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            FieldProgress
          </h1>
          <p className="text-2xl text-foreground font-medium max-w-3xl mx-auto">
            Revoluciona el control de avance en tus proyectos de construcción e ingeniería
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Captura progreso en tiempo real, genera reportes automáticos y mantén tus proyectos bajo control con nuestra plataforma profesional.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button 
            size="lg"
            className="gap-2 text-lg px-8 py-6 bg-primary text-white"
            asChild
          >
            <Link to="/auth">
              <Camera className="h-5 w-5" />
              Acceder a la Aplicación
            </Link>
          </Button>
          <Button 
            variant="outline"
            size="lg"
            className="gap-2 text-lg px-8 py-6"
            asChild
          >
            <Link to="/auth">
              <Database className="h-5 w-5" />
              Solicitar Demostración
            </Link>
          </Button>
        </div>
      </div>

      {/* ¿Qué es FieldProgress? */}
      <section className="text-center space-y-8">
        <h2 className="text-3xl font-bold text-foreground">¿Qué es FieldProgress?</h2>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          FieldProgress es la solución digital que transforma la gestión de proyectos de construcción e ingeniería. 
          Elimina los reportes en papel, reduce errores de comunicación y proporciona visibilidad en tiempo real 
          del avance de obra para equipos de campo, supervisores y gerencia.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="space-y-4">
            <div className="bg-chart-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <Smartphone className="h-8 w-8 text-chart-primary" />
            </div>
            <h3 className="text-xl font-semibold">Captura Móvil</h3>
            <p className="text-muted-foreground">Registra progreso desde cualquier lugar del proyecto con fotos y datos precisos</p>
          </div>
          <div className="space-y-4">
            <div className="bg-chart-success/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <BarChart3 className="h-8 w-8 text-chart-success" />
            </div>
            <h3 className="text-xl font-semibold">Análisis en Tiempo Real</h3>
            <p className="text-muted-foreground">Dashboard interactivo con curvas S y métricas de rendimiento actualizadas</p>
          </div>
          <div className="space-y-4">
            <div className="bg-chart-secondary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <FileText className="h-8 w-8 text-chart-secondary" />
            </div>
            <h3 className="text-xl font-semibold">Reportes Automáticos</h3>
            <p className="text-muted-foreground">Genera reportes PDF profesionales sin esfuerzo manual adicional</p>
          </div>
        </div>
      </section>

      {/* Beneficios Clave */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Beneficios Clave para tu Organización</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Optimiza cada aspecto de la gestión de proyectos con resultados medibles
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Clock,
              title: "Ahorra 70% del tiempo en reportes",
              description: "Automatiza la generación de reportes diarios y elimina trabajo manual repetitivo",
              color: "bg-chart-primary"
            },
            {
              icon: Shield,
              title: "Reduce errores en 85%",
              description: "Captura digital con validaciones evita errores de transcripción y cálculo",
              color: "bg-chart-success"
            },
            {
              icon: TrendingUp,
              title: "Mejora productividad 40%",
              description: "Visibilidad en tiempo real permite decisiones más rápidas y efectivas",
              color: "bg-chart-secondary"
            },
            {
              icon: Users,
              title: "Comunicación centralizada",
              description: "Mantén a todos los stakeholders informados con la misma información",
              color: "bg-chart-warning"
            },
            {
              icon: Target,
              title: "Cumple cronogramas",
              description: "Identifica desviaciones temprano y toma acciones correctivas oportunas",
              color: "bg-chart-danger"
            },
            {
              icon: Award,
              title: "Calidad certificada",
              description: "Trazabilidad completa y evidencia fotográfica para auditorías",
              color: "bg-chart-primary"
            }
          ].map((benefit, index) => (
            <Card key={index} className="construction-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 space-y-4">
                <div className={`w-12 h-12 rounded-lg ${benefit.color} flex items-center justify-center`}>
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Casos de Uso */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Para Cada Rol en tu Proyecto</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            FieldProgress se adapta a las necesidades específicas de cada miembro del equipo
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[
            {
              role: "Reporteros de Campo",
              icon: HardHat,
              benefits: [
                "Captura rápida de progreso con el móvil",
                "Interface simple y sin complicaciones", 
                "Funciona sin conexión a internet",
                "Fotos automáticamente organizadas"
              ]
            },
            {
              role: "Supervisores de Obra",
              icon: CheckSquare,
              benefits: [
                "Aprobación de reportes en un solo clic",
                "Vista completa del avance del proyecto",
                "Alertas automáticas de desviaciones",
                "Comparación con planificación base"
              ]
            },
            {
              role: "Gerentes de Proyecto",
              icon: BarChart3,
              benefits: [
                "Dashboard ejecutivo con KPIs clave",
                "Curvas S de progreso en tiempo real",
                "Análisis de productividad por actividad",
                "Exportación a Excel y PDF"
              ]
            },
            {
              role: "Stakeholders Ejecutivos",
              icon: TrendingUp,
              benefits: [
                "Reportes automáticos por email",
                "Vista consolidada de múltiples proyectos",
                "Alertas de cronograma y presupuesto",
                "Acceso desde cualquier dispositivo"
              ]
            }
          ].map((useCase, index) => (
            <Card key={index} className="construction-card">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-industrial-gradient p-3 rounded-lg">
                    <useCase.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{useCase.role}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {useCase.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-chart-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Estadísticas Impactantes */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Impacto Comprobado</h2>
          <p className="text-xl text-muted-foreground">Resultados reales de organizaciones que confían en FieldProgress</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="construction-card text-center">
            <CardContent className="p-6 space-y-2">
              <div className="text-4xl font-bold text-chart-primary">70%</div>
              <div className="text-sm text-muted-foreground">Reducción en tiempo de reportes</div>
              <div className="text-xs text-muted-foreground">vs. métodos tradicionales</div>
            </CardContent>
          </Card>

          <Card className="construction-card text-center">
            <CardContent className="p-6 space-y-2">
              <div className="text-4xl font-bold text-chart-success">85%</div>
              <div className="text-sm text-muted-foreground">Menos errores de datos</div>
              <div className="text-xs text-muted-foreground">captura digital vs. papel</div>
            </CardContent>
          </Card>

          <Card className="construction-card text-center">
            <CardContent className="p-6 space-y-2">
              <div className="text-4xl font-bold text-chart-warning">40%</div>
              <div className="text-sm text-muted-foreground">Mejora en productividad</div>
              <div className="text-xs text-muted-foreground">decisiones más rápidas</div>
            </CardContent>
          </Card>

          <Card className="construction-card text-center">
            <CardContent className="p-6 space-y-2">
              <div className="text-4xl font-bold text-chart-secondary">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoreo en tiempo real</div>
              <div className="text-xs text-muted-foreground">acceso desde cualquier lugar</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Características Principales */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Funcionalidades Principales</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Todo lo que necesitas para gestionar proyectos de construcción de manera profesional
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Captura Móvil Inteligente",
              description: "Registra progreso con fotos geolocalizadas, funciona offline y sincroniza automáticamente",
              icon: Smartphone,
              features: ["Interfaz optimizada para campo", "Captura con código QR", "Evidencia fotográfica", "Modo offline"]
            },
            {
              title: "Importación de Planificación",
              description: "Carga tu WBS desde Excel/CSV y mantén la estructura original de tu proyecto",
              icon: FileSpreadsheet,
              features: ["Formato estándar", "Validación automática", "Preserva jerarquía", "Mapeo inteligente"]
            },
            {
              title: "Dashboard Ejecutivo",
              description: "Análisis visual con curvas S, KPIs en tiempo real y alertas automáticas",
              icon: BarChart3,
              features: ["Curvas S interactivas", "KPIs en vivo", "Alertas inteligentes", "Comparaciones"]
            },
            {
              title: "Sistema de Aprobación",
              description: "Workflow multinivel para validación de reportes con trazabilidad completa",
              icon: CheckSquare,
              features: ["Flujo configurable", "Comentarios", "Histórico completo", "Notificaciones"]
            },
            {
              title: "Reportes Automáticos",
              description: "Genera PDFs profesionales con gráficos, fotos y análisis sin esfuerzo manual",
              icon: FileText,
              features: ["Plantillas personalizables", "Exportación automática", "Distribución por email", "Múltiples formatos"]
            },
            {
              title: "Gestión de Equipos",
              description: "Control de usuarios, roles y permisos adaptado a la estructura de tu organización",
              icon: Users,
              features: ["Roles granulares", "Permisos por proyecto", "Auditoría completa", "SSO empresarial"]
            }
          ].map((feature, index) => (
            <Card key={index} className="construction-card hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-industrial-gradient p-3 rounded-lg">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-chart-warning" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Acciones Rápidas - Simplificadas para landing */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Módulos Principales</h2>
          <p className="text-xl text-muted-foreground">Conoce las funcionalidades clave de FieldProgress</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Capturar Progreso",
              description: "Registra avance desde el campo con fotos y datos precisos",
              icon: Camera,
              color: "bg-chart-primary"
            },
            {
              title: "Aprobar Reportes", 
              description: "Sistema de validación multinivel con trazabilidad",
              icon: CheckSquare,
              color: "bg-chart-success"
            },
            {
              title: "Importar Planificación",
              description: "Carga tu WBS desde Excel manteniendo la estructura",
              icon: FileSpreadsheet,
              color: "bg-chart-warning"
            },
            {
              title: "Dashboard Analytics",
              description: "Curvas S, KPIs y análisis en tiempo real",
              icon: BarChart3,
              color: "bg-chart-secondary"
            }
          ].map((feature, index) => (
            <Card key={index} className="construction-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className={`w-16 h-16 rounded-xl ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="text-center space-y-8 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 py-16 -mx-6 px-6 rounded-2xl">
        <h2 className="text-4xl font-bold text-foreground">¿Listo para Transformar tus Proyectos?</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Únete a las empresas que ya optimizaron su gestión de obra con FieldProgress. 
          Comienza hoy mismo y experimenta la diferencia.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            className="gap-2 text-lg px-8 py-6"
            asChild
          >
            <Link to="/auth">
              <Camera className="h-5 w-5" />
              Empezar Ahora
            </Link>
          </Button>
          <Button 
            variant="outline"
            size="lg"
            className="gap-2 text-lg px-8 py-6"
            asChild
          >
            <Link to="/auth">
              <Database className="h-5 w-5" />
              Explorar Demo Completo
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-chart-success" />
              <span className="font-semibold">Setup en minutos</span>
            </div>
            <p className="text-sm text-muted-foreground">Configuración rápida sin IT especializado</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-chart-success" />
              <span className="font-semibold">Soporte 24/7</span>
            </div>
            <p className="text-sm text-muted-foreground">Asistencia técnica cuando la necesites</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-chart-success" />
              <span className="font-semibold">ROI garantizado</span>
            </div>
            <p className="text-sm text-muted-foreground">Resultados medibles desde el primer mes</p>
          </div>
        </div>
      </section>

      {/* Actividad Reciente - Mejorada */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Actividad Reciente del Sistema</h2>
          <p className="text-muted-foreground">Últimos eventos y actualizaciones en tiempo real</p>
        </div>
        
        <Card className="construction-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline de Eventos
            </CardTitle>
            <CardDescription>Monitoreo en vivo de todas las actividades del proyecto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-chart-success/10 border border-chart-success/20">
                <div className="bg-chart-success p-2 rounded-full">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Reporte diario aprobado por supervisor</p>
                  <p className="text-xs text-muted-foreground">Proyecto Torre Empresarial - Turno Día - hace 2 horas</p>
                </div>
                <Badge className="bg-chart-success text-white">Aprobado</Badge>
              </div>
              
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-chart-primary/10 border border-chart-primary/20">
                <div className="bg-chart-primary p-2 rounded-full">
                  <Camera className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Progreso capturado en campo</p>
                  <p className="text-xs text-muted-foreground">15 actividades de estructuras actualizadas con evidencia fotográfica</p>
                </div>
                <Badge variant="secondary">Sincronizado</Badge>
              </div>
              
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-chart-warning/10 border border-chart-warning/20">
                <div className="bg-chart-warning p-2 rounded-full">
                  <FileSpreadsheet className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nueva planificación importada</p>
                  <p className="text-xs text-muted-foreground">250 actividades de instalaciones y acabados - ayer</p>
                </div>
                <Badge variant="outline">Procesado</Badge>
              </div>
              
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50">
                <div className="bg-chart-secondary p-2 rounded-full">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Reporte semanal generado</p>
                  <p className="text-xs text-muted-foreground">Dashboard actualizado con métricas de rendimiento - hace 3 días</p>
                </div>
                <Badge variant="outline">Distribuido</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
