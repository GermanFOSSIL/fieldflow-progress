import { useState, ReactNode } from "react";
import { ModernSidebar } from "./ModernSidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(true); // Iniciar colapsado en móvil
  
  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <ModernSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isCollapsed 
          ? 'ml-0 lg:ml-16' 
          : 'ml-0 lg:ml-64'
      }`}>
        {/* Mobile menu button */}
        <div className="lg:hidden p-4 border-b bg-white shadow-sm">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2"
          >
            <Menu className="h-4 w-4" />
            Menú
          </Button>
        </div>
        
        <main className="flex-1 p-4 lg:p-6 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}