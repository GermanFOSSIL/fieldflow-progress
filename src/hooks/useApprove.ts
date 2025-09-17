import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mockProgressReports } from '@/lib/mock-data';
import { useSupabaseConnection } from './useSupabaseConnection';
import { toast } from 'sonner';

interface ProgressReport {
  id: string;
  project_id: string;
  user_id: string;
  date: string;
  shift: 'morning' | 'afternoon' | 'night';
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  total_activities: number;
  total_progress: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  reporter?: {
    id: string;
    email: string;
    full_name?: string;
  };
  entries?: ProgressEntry[];
}

interface ProgressEntry {
  id: string;
  activity_id: string;
  project_id: string;
  user_id: string;
  date: string;
  shift: 'morning' | 'afternoon' | 'night';
  quantity: number;
  comment?: string;
  photos?: string[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  activity?: {
    id: string;
    code: string;
    name: string;
    unit: string;
    boq_qty: number;
  };
}

export function useApprove(projectId?: string) {
  const queryClient = useQueryClient();
  const { isConnected } = useSupabaseConnection();

  // Fetch pending reports
  const { data: pendingReports, isLoading: reportsLoading } = useQuery({
    queryKey: ['pending-reports', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      if (!isConnected) {
        return mockProgressReports.filter(report => 
          report.project_id === projectId && 
          report.status === 'submitted'
        ) as ProgressReport[];
      }
      
      const { data, error } = await supabase
        .from('progress_reports')
        .select(`
          *,
          reporter:users(id, email, full_name),
          entries:progress_entries(
            *,
            activity:activities(id, code, name, unit, boq_qty)
          )
        `)
        .eq('project_id', projectId)
        .eq('status', 'submitted')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProgressReport[];
    },
    enabled: !!projectId
  });

  // Fetch all reports for history
  const { data: allReports, isLoading: allReportsLoading } = useQuery({
    queryKey: ['all-reports', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('progress_reports')
        .select(`
          *,
          reporter:users(id, email, full_name)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProgressReport[];
    },
    enabled: !!projectId
  });

  // Approve report mutation
  const approveReportMutation = useMutation({
    mutationFn: async ({ reportId, notes }: { reportId: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('progress_reports')
        .update({
          status: 'approved',
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)
        .select()
        .single();
      
      if (error) throw error;

      // Also approve all related entries
      await supabase
        .from('progress_entries')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('project_id', data.project_id)
        .eq('date', data.date)
        .eq('shift', data.shift);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-reports'] });
      queryClient.invalidateQueries({ queryKey: ['all-reports'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Reporte aprobado correctamente');
    },
    onError: (error) => {
      console.error('Error approving report:', error);
      toast.error('Error al aprobar el reporte');
    }
  });

  // Reject report mutation
  const rejectReportMutation = useMutation({
    mutationFn: async ({ reportId, reason }: { reportId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('progress_reports')
        .update({
          status: 'rejected',
          notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)
        .select()
        .single();
      
      if (error) throw error;

      // Also reject all related entries
      await supabase
        .from('progress_entries')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('project_id', data.project_id)
        .eq('date', data.date)
        .eq('shift', data.shift);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-reports'] });
      queryClient.invalidateQueries({ queryKey: ['all-reports'] });
      toast.success('Reporte rechazado');
    },
    onError: (error) => {
      console.error('Error rejecting report:', error);
      toast.error('Error al rechazar el reporte');
    }
  });

  // Get approval statistics
  const getApprovalStats = () => {
    if (!allReports) return null;

    const total = allReports.length;
    const pending = allReports.filter(r => r.status === 'submitted').length;
    const approved = allReports.filter(r => r.status === 'approved').length;
    const rejected = allReports.filter(r => r.status === 'rejected').length;

    return {
      total,
      pending,
      approved,
      rejected,
      approvalRate: total > 0 ? (approved / total) * 100 : 0
    };
  };

  // Approve report
  const approveReport = async (reportId: string, notes?: string) => {
    return approveReportMutation.mutateAsync({ reportId, notes });
  };

  // Reject report
  const rejectReport = async (reportId: string, reason: string) => {
    return rejectReportMutation.mutateAsync({ reportId, reason });
  };

  return {
    pendingReports,
    allReports,
    reportsLoading,
    allReportsLoading,
    approveReport,
    rejectReport,
    getApprovalStats,
    isApproving: approveReportMutation.isPending,
    isRejecting: rejectReportMutation.isPending
  };
}
