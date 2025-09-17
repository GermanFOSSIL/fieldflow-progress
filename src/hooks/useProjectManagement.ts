import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { insertSeedData } from '@/lib/seed-data';
import { mockProjects } from '@/lib/mock-data';
import { useSupabaseConnection } from './useSupabaseConnection';
import { toast } from 'sonner';

interface Project {
  id: string;
  code: string;
  name: string;
  status: 'active' | 'completed' | 'on-hold';
  description?: string;
  created_at: string;
  updated_at: string;
}

interface CreateProjectData {
  code: string;
  name: string;
  description?: string;
  status?: 'active' | 'completed' | 'on-hold';
}

export function useProjectManagement() {
  const queryClient = useQueryClient();
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);
  const { isConnected } = useSupabaseConnection();

  // Fetch all projects
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      if (!isConnected) {
        // Usar datos mock cuando no hay conexión
        return mockProjects as Project[];
      }
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Project[];
    }
  });

  // Create new project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: CreateProjectData) => {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          status: projectData.status || 'active'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Proyecto creado correctamente');
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast.error('Error al crear el proyecto');
    }
  });

  // Create demo project with seed data
  const createDemoProject = async () => {
    setIsCreatingDemo(true);
    try {
      // First create the demo project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .upsert({
          code: 'DEMO',
          name: 'Proyecto Demo - FieldProgress',
          description: 'Proyecto de demostración con datos de ejemplo para mostrar todas las funcionalidades del sistema',
          status: 'active'
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Then insert seed data
      const seedResult = await insertSeedData();
      
      if (seedResult.success) {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        queryClient.invalidateQueries({ queryKey: ['activities'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
        toast.success('Proyecto DEMO creado con datos de ejemplo');
        return project;
      } else {
        throw new Error('Error al insertar datos de ejemplo');
      }
    } catch (error) {
      console.error('Error creating demo project:', error);
      toast.error('Error al crear el proyecto DEMO');
      throw error;
    } finally {
      setIsCreatingDemo(false);
    }
  };

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Proyecto actualizado correctamente');
    },
    onError: (error) => {
      console.error('Error updating project:', error);
      toast.error('Error al actualizar el proyecto');
    }
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Proyecto eliminado correctamente');
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
      toast.error('Error al eliminar el proyecto');
    }
  });

  // Check if demo project exists
  const demoProjectExists = projects?.some(p => p.code === 'DEMO');

  return {
    projects,
    projectsLoading,
    createProject: createProjectMutation.mutateAsync,
    updateProject: updateProjectMutation.mutateAsync,
    deleteProject: deleteProjectMutation.mutateAsync,
    createDemoProject,
    isCreatingDemo,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
    demoProjectExists
  };
}
