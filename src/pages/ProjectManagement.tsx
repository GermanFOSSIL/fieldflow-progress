import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Building2, 
  Loader2, 
  Edit, 
  Trash2, 
  Play, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Users,
  BarChart3
} from "lucide-react";
import { useProjectManagement } from "@/hooks/useProjectManagement";
import { useProject } from "@/contexts/ProjectContext";
import { useSupabaseConnection } from "@/hooks/useSupabaseConnection";
import { toast } from "sonner";

export default function ProjectManagement() {
  const { selectedProject, setSelectedProject } = useProject();
  const { isConnected } = useSupabaseConnection();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [newProject, setNewProject] = useState({
    code: '',
    name: '',
    description: '',
    status: 'active' as const
  });

  const {
    projects,
    projectsLoading,
    createProject,
    updateProject,
    deleteProject,
    createDemoProject,
    isCreatingDemo,
    isCreating,
    isUpdating,
    isDeleting,
    demoProjectExists
  } = useProjectManagement();

  const handleCreateProject = async () => {
    if (!newProject.code || !newProject.name) {
      toast.error('Código y nombre son requeridos');
      return;
    }

    try {
      await createProject(newProject);
      setNewProject({ code: '', name: '', description: '', status: 'active' });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;

    try {
      await updateProject(editingProject);
      setEditingProject(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      try {
        await deleteProject(projectId);
        if (selectedProject?.id === projectId) {
          setSelectedProject(null);
        }
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleSelectProject = (project: any) => {
    setSelectedProject(project);
    toast.success(`Proyecto "${project.name}" seleccionado`);
  };

  const handleCreateDemo = async () => {
    try {
      const demoProject = await createDemoProject();
      if (demoProject) {
        setSelectedProject(demoProject);
      }
    } catch (error) {
      console.error('Error creating demo project:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-600">Activo</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completado</Badge>;
      case 'on-hold':
        return <Badge variant="outline">En Pausa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Proyectos</h1>
          <p className="text-muted-foreground">
            Crea, gestiona y selecciona proyectos para trabajar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "secondary"} className="text-sm">
            {isConnected ? "Conectado" : "Modo Demo"}
          </Badge>
          {selectedProject && (
            <Badge variant="secondary" className="text-sm">
              {selectedProject.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Demo Project Section */}
      {!demoProjectExists && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Play className="h-5 w-5" />
              ¡Comienza con el Proyecto DEMO!
            </CardTitle>
            <CardDescription className="text-blue-600">
              Crea un proyecto de demostración con datos de ejemplo para explorar todas las funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-blue-700 mb-2">
                  El proyecto DEMO incluye:
                </p>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Actividades de ejemplo (Piping, Eléctrico, Instrumentos)</li>
                  <li>• Datos de progreso simulados</li>
                  <li>• Reportes de ejemplo</li>
                  <li>• Estructura completa de proyecto</li>
                </ul>
              </div>
              <Button 
                onClick={handleCreateDemo} 
                disabled={isCreatingDemo}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreatingDemo ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Crear Proyecto DEMO
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Project Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Proyectos</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proyecto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
              <DialogDescription>
                Completa la información para crear un nuevo proyecto
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Código del Proyecto *</Label>
                <Input
                  id="code"
                  value={newProject.code}
                  onChange={(e) => setNewProject(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Ej: FP01, DEMO, etc."
                />
              </div>
              <div>
                <Label htmlFor="name">Nombre del Proyecto *</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Planta de Procesamiento"
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del proyecto..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={newProject.status} onValueChange={(value: any) => setNewProject(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="on-hold">En Pausa</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateProject} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Proyecto'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects List */}
      <Card>
        <CardContent className="p-0">
          {projectsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Cargando proyectos...</span>
            </div>
          ) : projects && projects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{project.name}</p>
                        {project.description && (
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell>{new Date(project.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {selectedProject?.id === project.id ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Seleccionado
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSelectProject(project)}
                          >
                            Seleccionar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingProject(project);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProject(project.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No hay proyectos
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crea tu primer proyecto o usa el proyecto DEMO para comenzar
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Proyecto
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Proyecto</DialogTitle>
            <DialogDescription>
              Modifica la información del proyecto
            </DialogDescription>
          </DialogHeader>
          {editingProject && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-code">Código del Proyecto</Label>
                <Input
                  id="edit-code"
                  value={editingProject.code}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, code: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-name">Nombre del Proyecto</Label>
                <Input
                  id="edit-name"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={editingProject.description || ''}
                  onChange={(e) => setEditingProject(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Estado</Label>
                <Select value={editingProject.status} onValueChange={(value: any) => setEditingProject(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="on-hold">En Pausa</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateProject} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Proyecto'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
