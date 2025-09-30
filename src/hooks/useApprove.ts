import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseConnection } from './useSupabaseConnection';
import { toast } from 'sonner';

interface DailyReport {
  id: string;
  project_id: string;
  reporter_id: string;
  report_date: string;
  shift: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  reporter?: {
    id: string;
    email?: string;
    full_name?: string;
  };
  entries?: ProgressEntry[];
}

interface ProgressEntry {
  id: string;
  daily_report_id: string;
  activity_id: string;
  qty_today: number;
  comment?: string;
  photo_urls?: string[];
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

  // Fetch pending reports (status = 'submitted')
  const { data: pendingReports, isLoading: reportsLoading } = useQuery({
    queryKey: ['pending-reports', projectId],
    queryFn: async () => {
      if (!projectId || !isConnected) return [];
      
      const { data, error } = await supabase
        .from('daily_reports')
        .select(`
          *,
          entries:progress_entries(
            *,
            activity:activities(id, code, name, unit, boq_qty)
          )
        `)
        .eq('project_id', projectId)
        .eq('status', 'submitted')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching pending reports:', error);
        return [];
      }
      
      // Fetch reporter info separately
      const reportsWithReporters = await Promise.all(
        (data || []).map(async (report) => {
          const { data: user } = await supabase
            .from('users')
            .select('id, full_name')
            .eq('id', report.reporter_id)
            .single();
          
          return {
            ...report,
            reporter: user || undefined
          };
        })
      );
      
      return reportsWithReporters as DailyReport[];
    },
    enabled: !!projectId && isConnected
  });

  // Fetch all reports for history
  const { data: allReports, isLoading: allReportsLoading } = useQuery({
    queryKey: ['all-reports', projectId],
    queryFn: async () => {
      if (!projectId || !isConnected) return [];
      
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching all reports:', error);
        return [];
      }
      
      // Fetch reporter info separately
      const reportsWithReporters = await Promise.all(
        (data || []).map(async (report) => {
          const { data: user } = await supabase
            .from('users')
            .select('id, full_name')
            .eq('id', report.reporter_id)
            .maybeSingle();
          
          return {
            ...report,
            reporter: user || undefined
          };
        })
      );
      
      return reportsWithReporters as DailyReport[];
    },
    enabled: !!projectId && isConnected
  });

  // Approve report mutation
  const approveReportMutation = useMutation({
    mutationFn: async ({ reportId, notes }: { reportId: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('daily_reports')
        .update({
          status: 'approved',
          notes: notes,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)
        .select()
        .single();
      
      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-reports'] });
      queryClient.invalidateQueries({ queryKey: ['all-reports'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['daily-reports'] });
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
        .from('daily_reports')
        .update({
          status: 'rejected',
          notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)
        .select()
        .single();
      
      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-reports'] });
      queryClient.invalidateQueries({ queryKey: ['all-reports'] });
      queryClient.invalidateQueries({ queryKey: ['daily-reports'] });
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
    pendingReports: pendingReports || [],
    allReports: allReports || [],
    reportsLoading,
    allReportsLoading,
    approveReport,
    rejectReport,
    getApprovalStats,
    isApproving: approveReportMutation.isPending,
    isRejecting: rejectReportMutation.isPending
  };
}
