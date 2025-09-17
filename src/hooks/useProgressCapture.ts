import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseConnection } from './useSupabaseConnection';
import { mockActivities, mockProgressEntries } from '@/lib/mock-data';
import { toast } from 'sonner';

interface ProgressEntry {
  id: string;
  activity_id: string;
  project_id: string;
  user_id: string;
  date: string;
  shift: string;
  quantity: number;
  comment: string;
  photos: string[];
  status: 'submitted' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  activity?: {
    id: string;
    name: string;
    code: string;
    unit: string;
    boq_qty: number;
    executed_qty: number;
    progress_percentage: number;
  };
}

interface ProgressCaptureData {
  activities: any[];
  todayEntries: any[];
  activitiesLoading: boolean;
  entriesLoading: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  saveProgressEntry: (activityId: string, quantity: number, comment: string) => Promise<void>;
  submitDailyReport: (notes: string) => Promise<void>;
  getProgressSummary: () => {
    totalActivities: number;
    completedActivities: number;
    totalProgress: number;
    averageProgress: number;
    completionRate: number;
    activitiesWithProgress: number;
  };
}

export function useProgressCapture(projectId?: string): ProgressCaptureData {
  const { isConnected } = useSupabaseConnection();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch activities for the project - modo offline forzado
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      console.log('🔧 Cargando actividades en modo offline para proyecto:', projectId);
      // Siempre usar datos mock en modo offline
      return mockActivities.filter(a => a.project_id === projectId && a.is_active);
    },
    enabled: !!projectId
  });

  // Fetch today's progress entries - modo offline forzado
  const { data: todayEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['today-entries', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const today = new Date().toISOString().split('T')[0];
      
      console.log('📊 Cargando entradas de progreso en modo offline para proyecto:', projectId, 'fecha:', today);
      // Siempre usar datos mock en modo offline
      return mockProgressEntries.filter(e => 
        e.project_id === projectId && 
        e.date === today
      );
    },
    enabled: !!projectId
  });

  // Save progress entry
  const saveProgressMutation = useMutation({
    mutationFn: async (data: {
      activityId: string;
      quantity: number;
      comment: string;
    }) => {
      if (!projectId) {
        throw new Error('Missing project ID');
      }

      setIsSubmitting(true);
      
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Modo offline forzado - simular guardado
        console.log('💾 Guardando progreso en modo offline:', data);
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newEntry: ProgressEntry = {
          id: `entry-${Date.now()}`,
          activity_id: data.activityId,
          project_id: projectId,
          user_id: 'user-1',
          date: today,
          shift: 'morning',
          quantity: data.quantity,
          comment: data.comment,
          photos: [],
          status: 'submitted' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          activity: mockActivities.find(a => a.id === data.activityId)
        };
        
        toast.success('Progreso guardado exitosamente (modo offline)');
        return newEntry;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-entries'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
    onError: (error) => {
      console.error('Error saving progress:', error);
      toast.error('Error al guardar el progreso');
    }
  });

  // Update progress entry
  const updateProgressMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProgressEntry> }) => {
      setIsSubmitting(true);
      
      try {
        // Siempre usar datos mock por ahora ya que Supabase no está disponible
        if (true || !isConnected) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          toast.success('Progreso actualizado exitosamente');
          return;
        }

        const { error } = await supabase
          .from('progress_entries')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
        
        if (error) throw error;
        toast.success('Progreso actualizado exitosamente');
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-entries'] });
    },
    onError: (error) => {
      console.error('Error updating progress:', error);
      toast.error('Error al actualizar el progreso');
    }
  });

  // Delete progress entry
  const deleteProgressMutation = useMutation({
    mutationFn: async (id: string) => {
      setIsSubmitting(true);
      
      try {
        // Siempre usar datos mock por ahora ya que Supabase no está disponible
        if (true || !isConnected) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          toast.success('Progreso eliminado exitosamente');
          return;
        }

        const { error } = await supabase
          .from('progress_entries')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        toast.success('Progreso eliminado exitosamente');
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-entries'] });
    },
    onError: (error) => {
      console.error('Error deleting progress:', error);
      toast.error('Error al eliminar el progreso');
    }
  });

  const saveProgressEntry = async (activityId: string, quantity: number, comment: string) => {
    await saveProgressMutation.mutateAsync({ activityId, quantity, comment });
  };

  const submitDailyReport = async (notes: string) => {
    setIsSubmitting(true);
    try {
      // Simular envío de reporte diario
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Reporte diario enviado exitosamente');
    } catch (error) {
      toast.error('Error al enviar el reporte');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressSummary = () => {
    const totalActivities = activities.length;
    const completedActivities = todayEntries.length;
    const totalProgress = activities.reduce((sum, activity) => sum + ((activity as any).executed_qty || 0), 0);
    const averageProgress = totalActivities > 0 ? totalProgress / totalActivities : 0;
    const completionRate = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
    const activitiesWithProgress = completedActivities;

    return {
      totalActivities,
      completedActivities,
      totalProgress,
      averageProgress,
      completionRate,
      activitiesWithProgress
    };
  };

  return {
    activities,
    todayEntries,
    activitiesLoading,
    entriesLoading,
    isSaving: saveProgressMutation.isPending,
    isSubmitting,
    saveProgressEntry,
    submitDailyReport,
    getProgressSummary
  };
}
