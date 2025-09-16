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

export function ProjectSelectorIcon() {
  const { selectedProject, projects, setSelectedProject, isLoading } = useProject();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2">
        <Building2 className="h-4 w-4 text-muted-foreground animate-pulse" />
        <span className="text-sm text-muted-foreground">Cargando...</span>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Sin proyectos</span>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-700 dark:text-green-300';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
      case 'completed':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'paused':
        return 'Pausado';
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
          className="flex items-center space-x-2 px-3 py-2 h-auto text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Building2 className="h-4 w-4" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">
              {selectedProject ? selectedProject.name : "Seleccionar Proyecto"}
            </span>
            {selectedProject && (
              <span className="text-xs text-muted-foreground">
                {selectedProject.code}
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className="flex items-center justify-between py-3 cursor-pointer"
          >
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{project.name}</span>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getStatusColor(project.status)}`}
                >
                  {getStatusText(project.status)}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                Código: {project.code}
              </span>
            </div>
            {selectedProject?.id === project.id && (
              <Building2 className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}