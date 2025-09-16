import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SmartProjectSelector } from "./SmartProjectSelector";
import { 
  HardHat, 
  Menu, 
  X, 
  BarChart3, 
  Camera, 
  CheckSquare, 
  Upload, 
  FileText,
  Home,
  Bell,
  LogOut,
  MessageCircle,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { title: "Panel", url: "/dashboard", icon: Home },
  { title: "Cargar Avances", url: "/capture", icon: Camera },
  { title: "Aprobaciones", url: "/approve", icon: CheckSquare },
  { title: "Importar Plan", url: "/import", icon: Upload },
  { title: "Reportes", url: "/reports", icon: FileText },
  { title: "Analítica", url: "/analytics", icon: BarChart3 },
  { title: "WhatsApp", url: "/whatsapp", icon: MessageCircle },
  { title: "Templates WhatsApp", url: "/whatsapp-templates", icon: MessageSquare },
  { title: "Base de Datos", url: "/database", icon: BarChart3 },
];

export function AppNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { signOut, userProfile, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-sidebar border-b border-sidebar-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y nombre */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="bg-primary p-2 rounded-lg">
                <HardHat className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-sidebar-foreground">FieldProgress</span>
            </Link>
          </div>

          {/* Navegación desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                to={item.url}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.url)
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.title}
              </Link>
            ))}
          </div>

          {/* Selector de proyecto y acciones */}
          <div className="flex items-center space-x-4">
            <SmartProjectSelector />
            <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent">
              <Bell className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(userProfile?.full_name || user?.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {userProfile?.full_name || user?.email || "Usuario"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Rol: {userProfile?.role || "reporter"}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Botón hamburguesa móvil */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="text-sidebar-foreground"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isOpen && (
        <div className="md:hidden border-t border-sidebar-border">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-sidebar">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                to={item.url}
                className={`flex items-center px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                  isActive(item.url)
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}