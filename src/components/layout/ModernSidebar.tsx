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
  User,
  Menu
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
      { title: "Proyectos", url: "/projects", icon: BarChart3, color: "text-blue-600" },
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
    <TooltipProvider>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      <div className={`
        fixed left-0 top-0 h-screen bg-white border-r border-slate-200 shadow-sm
        transition-all duration-300 ease-in-out z-40 flex flex-col
        ${isCollapsed ? 'w-16 -translate-x-full lg:translate-x-0' : 'w-64 translate-x-0'}
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
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">FP</span>
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-slate-900">FieldProgress</h1>
                <p className="text-xs text-slate-500">Gestión de Proyectos</p>
              </div>
            )}
          </div>
        </div>

        {/* Project Selector */}
        <div className="p-4">
          <ProjectSelectorIcon isCollapsed={isCollapsed} />
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 min-h-0">
          {navigationSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const active = isActive(item.url);
                  
                  const linkContent = (
                    <Link
                      key={itemIndex}
                      to={item.url}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                        ${active 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }
                        ${isCollapsed ? 'justify-center px-2' : ''}
                      `}
                    >
                      <Icon className={`h-4 w-4 flex-shrink-0 ${active ? item.color : 'text-slate-500'}`} />
                      {!isCollapsed && (
                        <span className="truncate">{item.title}</span>
                      )}
                    </Link>
                  );

                  return isCollapsed ? (
                    <Tooltip key={itemIndex}>
                      <TooltipTrigger asChild>
                        {linkContent}
                      </TooltipTrigger>
                      <TooltipContent side="right" className="ml-2">
                        <p>{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : linkContent;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              <NotificationCenter />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                    <Avatar className="h-8 w-8">
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
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <NotificationCenter />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                    <Avatar className="h-8 w-8">
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
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}