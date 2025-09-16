import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Mail, CheckCircle, AlertTriangle } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await signIn(email);

    if (error) {
      setError("Error al iniciar sesión, inténtalo nuevamente.");
      console.error("Sign in error:", error);
    } else {
      setMessage("Revisa tu correo, te enviamos un enlace de acceso.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="construction-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Iniciar sesión en FieldProgress
            </CardTitle>
            <CardDescription>
              Ingresa tu email para recibir un enlace de acceso
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <Alert className="border-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert className="border-chart-success">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-chart-success">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-primary text-white"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar enlace de acceso"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                Al iniciar sesión aceptas los términos de uso de FieldProgress.
              </p>
              <p className="mt-2">
                ¿Primera vez? Se creará automáticamente tu cuenta como reportero.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}