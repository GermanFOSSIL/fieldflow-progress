import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  name: string;
  code: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Fetch all projects
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data as Project[];
    }
  });

  // Auto-select first project if none selected
  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  // Store selected project in localStorage
  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('selectedProjectId', selectedProject.id);
    }
  }, [selectedProject]);

  // Restore selected project from localStorage
  useEffect(() => {
    const savedProjectId = localStorage.getItem('selectedProjectId');
    if (savedProjectId && projects.length > 0 && !selectedProject) {
      const savedProject = projects.find(p => p.id === savedProjectId);
      if (savedProject) {
        setSelectedProject(savedProject);
      }
    }
  }, [projects, selectedProject]);

  const value = {
    selectedProject,
    setSelectedProject,
    projects,
    isLoading,
    error: error as Error | null
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}