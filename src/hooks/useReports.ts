import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mockProgressReports, mockProgressEntries, mockActivities } from '@/lib/mock-data';
import { useSupabaseConnection } from './useSupabaseConnection';
import { toast } from 'sonner';

interface ReportData {
  id: string;
  report_date: string;
  shift: 'day' | 'night';
  reporter_name?: string;
  status: 'approved' | 'rejected' | 'submitted' | 'draft';
  notes?: string;
  created_at: string;
}

interface ActivityProgress {
  activity_id: string;
  activity_code: string;
  activity_name: string;
  unit: string;
  boq_qty: number;
  qty_accum: number;
  pct: number;
  last_updated: string;
}

interface ProjectSummary {
  total_activities: number;
  completed_activities: number;
  total_progress: number;
  avg_progress: number;
}

export function useReports(projectId?: string) {
  const { isConnected } = useSupabaseConnection();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Fetch historical reports
  const { data: historicalReports, isLoading: reportsLoading } = useQuery({
    queryKey: ['historical-reports', projectId, dateRange],
    queryFn: async () => {
      if (!projectId) return [];
      
      if (!isConnected) {
        return mockProgressReports.filter(report => 
          report.project_id === projectId
        ).map(r => ({
          id: r.id,
          report_date: r.date,
          shift: r.shift as 'day' | 'night',
          reporter_name: 'Mock User',
          status: r.status as any,
          notes: r.notes,
          created_at: r.created_at
        }));
      }
      
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('project_id', projectId)
        .gte('report_date', dateRange.startDate)
        .lte('report_date', dateRange.endDate)
        .order('report_date', { ascending: false });
      
      if (error) throw error;

      // Fetch reporter names
      const reportsWithNames = await Promise.all(
        (data || []).map(async (report) => {
          const { data: user } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', report.reporter_id)
            .maybeSingle();
          
          return {
            ...report,
            reporter_name: user?.full_name || 'Usuario'
          };
        })
      );

      return reportsWithNames as ReportData[];
    },
    enabled: !!projectId
  });

  // Fetch activity progress summary
  const { data: activityProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['activity-progress', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      if (!isConnected) {
        return mockActivities.filter(activity => 
          activity.project_id === projectId
        ).map(activity => ({
          activity_id: activity.id,
          activity_code: activity.code,
          activity_name: activity.name,
          unit: activity.unit,
          boq_qty: activity.boq_qty,
          qty_accum: activity.executed_qty,
          pct: activity.progress_percentage / 100,
          last_updated: activity.updated_at
        }));
      }
      
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('id, code, name, unit, boq_qty');
      
      if (activitiesError) throw activitiesError;

      const { data: progress, error: progressError } = await supabase
        .from('activity_progress_agg')
        .select('*');
      
      if (progressError) throw progressError;

      const result: ActivityProgress[] = activities.map(activity => {
        const activityProgress = progress?.find(p => p.activity_id === activity.id);
        return {
          activity_id: activity.id,
          activity_code: activity.code,
          activity_name: activity.name,
          unit: activity.unit,
          boq_qty: activity.boq_qty,
          qty_accum: activityProgress?.qty_accum || 0,
          pct: activityProgress?.pct || 0,
          last_updated: activityProgress?.last_updated || new Date().toISOString()
        };
      });

      return result;
    },
    enabled: !!projectId
  });

  // Fetch project summary
  const { data: projectSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['project-summary', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      if (!isConnected) {
        const activities = mockActivities.filter(a => a.project_id === projectId);
        const totalActivities = activities.length;
        const completedActivities = activities.filter(a => a.executed_qty >= a.boq_qty).length;
        const totalProgress = activities.reduce((sum, a) => sum + a.executed_qty, 0);
        const totalBOQ = activities.reduce((sum, a) => sum + a.boq_qty, 0);
        const avgProgress = totalBOQ > 0 ? (totalProgress / totalBOQ) * 100 : 0;

        return {
          total_activities: totalActivities,
          completed_activities: completedActivities,
          total_progress: Math.round(totalProgress),
          avg_progress: Math.round(avgProgress)
        };
      }
      
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('id, boq_qty');
      
      if (activitiesError) throw activitiesError;

      const { data: progress, error: progressError } = await supabase
        .from('activity_progress_agg')
        .select('*');
      
      if (progressError) throw progressError;

      const totalActivities = activities?.length || 0;
      const completedActivities = progress?.filter(p => p.pct >= 1.0).length || 0;
      const totalProgress = progress?.reduce((sum, p) => sum + p.qty_accum, 0) || 0;
      const avgProgress = progress?.length 
        ? (progress.reduce((sum, p) => sum + p.pct, 0) / progress.length) * 100
        : 0;

      return {
        total_activities: totalActivities,
        completed_activities: completedActivities,
        total_progress: Math.round(totalProgress),
        avg_progress: Math.round(avgProgress)
      };
    },
    enabled: !!projectId
  });

  // Generate PDF report
  const generatePDFReport = async (reportType: 'daily' | 'weekly' | 'monthly') => {
    if (!projectId) {
      toast.error('No hay proyecto seleccionado');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('modern-pdf-report', {
        body: {
          projectId,
          reportType,
          dateRange: {
            from: dateRange.startDate,
            to: dateRange.endDate
          }
        }
      });

      if (error) throw error;

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Reporte PDF generado correctamente');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar el reporte PDF');
    }
  };

  // Export to Excel
  const exportToExcel = async () => {
    if (!historicalReports || !activityProgress) {
      toast.error('No hay datos para exportar');
      return;
    }

    try {
      const reportsCSV = [
        'Fecha,Turno,Reportero,Estado,Notas',
        ...historicalReports.map(report => [
          report.report_date,
          report.shift,
          report.reporter_name || 'N/A',
          report.status,
          report.notes || ''
        ].join(','))
      ].join('\n');

      const activitiesCSV = [
        'Código,Actividad,Unidad,BOQ,Acumulado,Progreso%,Última Actualización',
        ...activityProgress.map(activity => [
          activity.activity_code,
          activity.activity_name,
          activity.unit,
          activity.boq_qty,
          activity.qty_accum,
          Math.round(activity.pct * 100),
          new Date(activity.last_updated).toLocaleDateString()
        ].join(','))
      ].join('\n');

      const zipContent = `Reportes\n${reportsCSV}\n\nActividades\n${activitiesCSV}`;
      
      const blob = new Blob([zipContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reportes-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Datos exportados correctamente');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error al exportar los datos');
    }
  };

  // Get report statistics
  const getReportStats = () => {
    if (!historicalReports) return null;

    const total = historicalReports.length;
    const approved = historicalReports.filter(r => r.status === 'approved').length;
    const rejected = historicalReports.filter(r => r.status === 'rejected').length;
    const pending = historicalReports.filter(r => r.status === 'submitted').length;

    return {
      total,
      approved,
      rejected,
      pending,
      averageProgress: 0
    };
  };

  return {
    historicalReports,
    activityProgress,
    projectSummary,
    reportsLoading,
    progressLoading,
    summaryLoading,
    dateRange,
    setDateRange,
    generatePDFReport,
    exportToExcel,
    getReportStats
  };
}
