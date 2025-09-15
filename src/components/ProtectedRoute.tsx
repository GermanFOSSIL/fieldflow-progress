import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'reporter' | 'supervisor' | 'viewer';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // TODO: Implementar verificación de roles cuando tengamos los datos del perfil
  // if (requiredRole && userRole !== requiredRole) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return <>{children}</>;
}