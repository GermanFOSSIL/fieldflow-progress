import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, BarChart3, Users, CheckCircle, ArrowRight, Shield, Clock, Target } from "lucide-react";

export default function Welcome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Seguimiento en Tiempo Real",
      description: "Monitorea el avance de tus proyectos de construcción con reportes diarios detallados"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Gestión de Equipos",
      description: "Organiza reporteros, supervisores y equipos de trabajo de manera eficiente"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Control de Calidad",
      description: "Sistema de aprobaciones y validaciones para garantizar la precisión de los datos"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Análisis de Productividad",
      description: "Métricas y análisis detallados para optimizar el rendimiento de tus proyectos"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center shadow-lg">
                <Building className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Field<span className="text-primary">Progress</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              La plataforma profesional para el seguimiento y control de avance de obras de construcción
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-8 py-3 h-12"
              >
                Comenzar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/auth")}
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-3 h-12"
              >
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Todo lo que necesitas para gestionar tus proyectos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Herramientas profesionales diseñadas específicamente para la industria de la construcción
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="construction-card hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Optimiza la gestión de tus proyectos de construcción
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                FieldProgress te permite tener control total sobre el avance de tus obras, 
                mejorando la productividad y reduciendo los tiempos de entrega.
              </p>
              
              <div className="space-y-4">
                {[
                  "Reportes diarios digitalizados y organizados",
                  "Sistema de aprobaciones multinivel",
                  "Análisis de productividad en tiempo real",
                  "Seguimiento fotográfico del progreso",
                  "Integración con equipos de campo"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <Card className="construction-card p-8">
                <div className="text-center">
                  <Clock className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    ¿Listo para comenzar?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Únete a FieldProgress y transforma la manera en que gestionas tus proyectos de construcción.
                  </p>
                  <Button 
                    size="lg"
                    onClick={() => navigate("/auth")}
                    className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-8 py-3 w-full"
                  >
                    Crear Cuenta Gratuita
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-sidebar-primary-foreground" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">FieldProgress</h3>
            <p className="text-sidebar-foreground/80">
              Gestión profesional de avance de obras
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}