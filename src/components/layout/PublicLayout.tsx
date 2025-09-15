import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HardHat, LogIn } from "lucide-react";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header público */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="bg-industrial-gradient p-2 rounded-lg">
                <HardHat className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">FieldProgress</span>
            </div>

            {/* Navegación y acciones */}
            <div className="flex items-center space-x-4">
              <Button asChild>
                <Link to="/auth" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Acceder a la Aplicación
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 FieldProgress. Sistema de gestión de proyectos de construcción.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}