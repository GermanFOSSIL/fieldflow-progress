import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useProject } from "@/contexts/ProjectContext";
import { Building2, Loader2 } from "lucide-react";

export function ProjectSelector() {
  const { selectedProject, setSelectedProject, projects, isLoading } = useProject();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted/50">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Cargando proyectos...</span>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted/50">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Sin proyectos disponibles</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select 
        value={selectedProject?.id || ''} 
        onValueChange={(value) => {
          const project = projects.find(p => p.id === value);
          setSelectedProject(project || null);
        }}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Seleccionar proyecto" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-start">
                  <span className="font-medium">{project.name}</span>
                  <div className="flex items-center gap-2">
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