import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Construction } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="construction-card text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              ¡Ups! Página no encontrada
            </CardTitle>
            <CardDescription>
              La página que buscas no existe o ha sido movida
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert>
              <Construction className="h-4 w-4" />
              <AlertDescription>
                Error 404 - La ruta solicitada no está disponible en FieldProgress
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Puedes intentar:
              </p>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-chart-success" />
                  Verificar la URL en la barra de direcciones
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-chart-success" />
                  Volver al panel principal
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-chart-success" />
                  Contactar al administrador del sistema
                </li>
              </ul>
            </div>

            <Link to="/dashboard">
              <Button className="w-full bg-primary text-white">
                Volver al Inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}