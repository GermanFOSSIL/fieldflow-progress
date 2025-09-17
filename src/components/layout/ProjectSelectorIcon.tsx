import { Building2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useProject } from "@/contexts/ProjectContext";

interface ProjectSelectorIconProps {
  isCollapsed?: boolean;
}

export function ProjectSelectorIcon({ isCollapsed = false }: ProjectSelectorIconProps) {
  const { selectedProject, projects, setSelectedProject, isLoading } = useProject();

  if (isLoading) {
    return (
      <div className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-2 px-3'} py-2`}>
        <Building2 className="h-4 w-4 text-slate-500 animate-pulse" />
        {!isCollapsed && <span className="text-sm text-slate-500">Cargando...</span>}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-2 px-3'} py-2`}>
        <Building2 className="h-4 w-4 text-slate-500" />
        {!isCollapsed && <span className="text-sm text-slate-500">Sin proyectos</span>}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'on-hold':
        return 'En Pausa';
      case 'completed':
        return 'Completado';
      default:
        return status;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`flex items-center ${isCollapsed ? 'justify-center px-2 w-full' : 'justify-between px-3 w-full'} py-2 h-auto text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Building2 className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && (
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-sm font-medium truncate">
                  {selectedProject ? selectedProject.name : "Seleccionar Proyecto"}
                </span>
                {selectedProject && (
                  <span className="text-xs text-slate-500 truncate">
                    {selectedProject.code}
                  </span>
                )}
              </div>
            )}
          </div>
          {!isCollapsed && (
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className="flex items-center justify-between py-3 cursor-pointer hover:bg-slate-50"
          >
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-slate-900">{project.name}</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs border ${getStatusColor(project.status)}`}
                >
                  {getStatusText(project.status)}
                </Badge>
              </div>
              <span className="text-sm text-slate-500">
                Código: {project.code}
              </span>
            </div>
            {selectedProject?.id === project.id && (
              <Building2 className="h-4 w-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}