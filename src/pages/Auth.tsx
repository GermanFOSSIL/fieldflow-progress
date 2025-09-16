import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Mail, CheckCircle, AlertTriangle, User, Building, UserPlus, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados para login
  const [loginEmail, setLoginEmail] = useState("");
  
  // Estados para registro
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.signInWithOtp({
        email: loginEmail,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        setError("Error al enviar el enlace de acceso. Verifica tu email e inténtalo nuevamente.");
        console.error("Sign in error:", error);
      } else {
        setMessage("¡Perfecto! Revisa tu correo, te enviamos un enlace de acceso seguro.");
      }
    } catch (err) {
      setError("Error inesperado. Inténtalo nuevamente.");
      console.error("Login error:", err);
    }

    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupEmail || !signupPassword || !fullName) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (signupPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (signupPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        if (error.message.includes("already registered")) {
          setError("Este email ya está registrado. Usa la pestaña de Iniciar Sesión.");
        } else if (error.message.includes("invalid")) {
          setError("Email inválido. Verifica el formato.");
        } else {
          setError("Error al crear la cuenta. Inténtalo nuevamente.");
        }
        console.error("Sign up error:", error);
      } else {
        setMessage("¡Cuenta creada exitosamente! Revisa tu correo para confirmar tu cuenta y poder acceder.");
      }
    } catch (err) {
      setError("Error inesperado al crear la cuenta.");
      console.error("Signup error:", err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="construction-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-lg">
                <Building className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              FieldProgress
            </CardTitle>
            <CardDescription>
              Gestión profesional de avance de obras
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Registrarse
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">
                      Correo electrónico
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="tu@empresa.com"
                      required
                      disabled={loading}
                      className="h-10"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-10 bg-primary hover:bg-primary-hover text-primary-foreground font-medium"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar enlace de acceso"}
                  </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                  <p>Te enviaremos un enlace seguro por email</p>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name" className="text-sm font-medium">
                      Nombre completo *
                    </Label>
                    <Input
                      id="full-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Juan Pérez"
                      required
                      disabled={loading}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">
                      Correo electrónico *
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="tu@empresa.com"
                      required
                      disabled={loading}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">
                      Contraseña *
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      disabled={loading}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium">
                      Confirmar contraseña *
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      required
                      disabled={loading}
                      className="h-10"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-10 bg-success hover:bg-success/90 text-success-foreground font-medium"
                    disabled={loading}
                  >
                    {loading ? "Creando cuenta..." : "Crear cuenta"}
                  </Button>
                </form>

                <div className="text-center text-xs text-muted-foreground">
                  <p>Al registrarte serás asignado como <span className="font-medium">Reportero</span></p>
                  <p>Un supervisor puede cambiar tu rol posteriormente</p>
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert className="mt-4 border-destructive/50 bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="mt-4 border-success/50 bg-success/10">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription className="text-success text-sm">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-6 pt-4 border-t border-border text-center text-xs text-muted-foreground">
              <p>
                Al usar FieldProgress aceptas nuestros términos de servicio y política de privacidad.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}