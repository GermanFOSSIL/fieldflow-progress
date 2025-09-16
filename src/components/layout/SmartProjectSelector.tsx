import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useProject } from "@/contexts/ProjectContext";
import { Building2, Loader2, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";

export function SmartProjectSelector() {
  const { selectedProject, setSelectedProject, projects, isLoading } = useProject();
  const location = useLocation();

  // Routes where project selector should be visible
  const projectRelevantRoutes = ['/dashboard', '/whatsapp', '/whatsapp-templates', '/capture', '/reports', '/analytics', '/ai-assistant', '/approve'];
  const shouldShow = projectRelevantRoutes.some(route => location.pathname.startsWith(route));

  if (!shouldShow) return null;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 border rounded-lg bg-muted/50">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Cargando...</span>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 border rounded-lg bg-muted/50">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Sin proyectos</span>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <Select 
        value={selectedProject?.id || ''} 
        onValueChange={(value) => {
          const project = projects.find(p => p.id === value);
          setSelectedProject(project || null);
        }}
      >
        <SelectTrigger className="h-9 w-auto min-w-[200px] border-0 bg-transparent hover:bg-muted/50 focus:ring-0 focus:ring-offset-0">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <div className="flex flex-col items-start">
              {selectedProject ? (
                <>
                  <span className="text-sm font-medium text-foreground">{selectedProject.name}</span>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs h-4 px-1">
                      {selectedProject.code}
                    </Badge>
                    <div className={`w-2 h-2 rounded-full ${
                      selectedProject.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                  </div>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Seleccionar proyecto</span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </SelectTrigger>
        <SelectContent align="start" className="w-[300px]">
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex items-center gap-3 w-full">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col flex-1">
                  <span className="font-medium">{project.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {project.code}
                    </Badge>
                    <Badge 
                      variant={project.status === 'active' ? 'default' : 'secondary'} 
                      className="text-xs"
                    >
                      {project.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}