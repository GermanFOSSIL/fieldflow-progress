import { 
  BarChart3, 
  CheckSquare, 
  HardHat, 
  Upload, 
  FileText,
  Home,
  MessageSquare,
  Bot,
  Brain,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ProjectSelectorIcon } from "./ProjectSelectorIcon";
import { NotificationCenter } from "../notifications/NotificationCenter";
import { useAuth } from "@/contexts/AuthContext";

const navigationSections = [
  {
    title: "Principal",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: Home, color: "text-blue-600" },
      { title: "Capturar Avances", url: "/capture", icon: HardHat, color: "text-orange-600" },
      { title: "Aprobar", url: "/approve", icon: CheckSquare, color: "text-green-600" }
    ]
  },
  {
    title: "Gestión",
    items: [
      { title: "Importar Plan", url: "/import", icon: Upload, color: "text-purple-600" },
      { title: "Reportes", url: "/reports", icon: FileText, color: "text-red-600" },
      { title: "Analítica", url: "/analytics", icon: TrendingUp, color: "text-cyan-600" }
    ]
  },
  {
    title: "Comunicación",
    items: [
      { title: "WhatsApp", url: "/whatsapp", icon: MessageSquare, color: "text-[#25D366]" },
      { title: "Asistente IA", url: "/ai-assistant", icon: Brain, color: "text-violet-600" }
    ]
  },
  {
    title: "Admin",
    items: [
      { title: "Templates", url: "/whatsapp-templates", icon: Settings, color: "text-gray-600" },
      { title: "Base de Datos", url: "/database", icon: BarChart3, color: "text-indigo-600" }
    ]
  }
];

export function ModernSidebar({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean; setIsCollapsed: (collapsed: boolean) => void }) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;
  
  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className={`
      fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/50
      transition-all duration-300 ease-in-out z-40
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
      
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border border-slate-200 bg-white shadow-sm hover:shadow-md"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? 
          <ChevronRight className="h-3 w-3" /> : 
          <ChevronLeft className="h-3 w-3" />
        }
      </Button>

      {/* Header */}
      <div className="p-4 border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">SC</span>
          </div>
          {!isCollapsed && (
            <div>
            <h1 className="font-bold text-slate-800">Sistema Construcción</h1>
            <p className="text-xs text-slate-500">Gestión de Proyectos</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {navigationSections.map((section, sectionIndex) => (
          <div key={section.title} className="mb-6">
            {!isCollapsed && (
              <h3 className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {section.title}
              </h3>
            )}
            
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.url}
                  end
                  className={({ isActive }) => `
                    mx-2 flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <item.icon className={`h-5 w-5 ${isActive(item.url) ? 'text-blue-600' : item.color}`} />
                  {!isCollapsed && (
                    <span className="font-medium text-sm">{item.title}</span>
                  )}
                  {isActive(item.url) && !isCollapsed && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200/50 p-3">
        <div className="flex items-center gap-2">
          <ProjectSelectorIcon />
          
          {!isCollapsed && (
            <>
              <div className="flex-1" />
              <NotificationCenter />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-gradient-to-br from-slate-600 to-slate-700 text-white">
                        {user?.email ? getInitials(user.email) : <User className="h-3 w-3" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs">
                    {user?.email || 'Usuario'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-xs text-red-600">
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </div>
  );
}