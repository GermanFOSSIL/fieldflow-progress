import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mockProgressReports, mockProgressEntries, mockActivities } from '@/lib/mock-data';
import { useSupabaseConnection } from './useSupabaseConnection';
import { toast } from 'sonner';

interface ReportData {
  id: string;
  date: string;
  shift: 'morning' | 'afternoon' | 'night';
  reporter: string;
  status: 'approved' | 'rejected' | 'submitted';
  total_activities: number;
  total_progress: number;
  notes?: string;
  created_at: string;
}

interface ActivityProgress {
  activity_id: string;
  activity_code: string;
  activity_name: string;
  unit: string;
  boq_qty: number;
  total_executed: number;
  progress_percentage: number;
  last_updated: string;
}

interface ProjectSummary {
  total_activities: number;
  completed_activities: number;
  total_progress: number;
  average_daily_progress: number;
  completion_percentage: number;
}

export function useReports(projectId?: string) {
  const { isConnected } = useSupabaseConnection();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0]
  });

  // Fetch historical reports
  const { data: historicalReports, isLoading: reportsLoading } = useQuery({
    queryKey: ['historical-reports', projectId, dateRange],
    queryFn: async () => {
      if (!projectId) return [];
      
      if (!isConnected) {
        return mockProgressReports.filter(report => 
          report.project_id === projectId &&
          report.date >= dateRange.startDate &&
          report.date <= dateRange.endDate
        ) as ReportData[];
      }
      
      const { data, error } = await supabase
        .from('progress_reports')
        .select(`
          *,
          reporter:users(email, full_name)
        `)
        .eq('project_id', projectId)
        .gte('date', dateRange.startDate)
        .lte('date', dateRange.endDate)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as ReportData[];
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
          total_executed: activity.executed_qty,
          progress_percentage: activity.progress_percentage,
          last_updated: activity.updated_at
        })) as ActivityProgress[];
      }
      
      const { data, error } = await supabase
        .from('activities')
        .select(`
          id,
          code,
          name,
          unit,
          boq_qty,
          executed_qty,
          progress_percentage,
          updated_at
        `)
        .eq('project_id', projectId)
        .eq('is_active', true)
        .order('progress_percentage', { ascending: false });
      
      if (error) throw error;
      return data as ActivityProgress[];
    },
    enabled: !!projectId
  });

  // Fetch project summary
  const { data: projectSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['project-summary', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      if (!isConnected) {
        // Usar datos mock para el resumen
        const activities = mockActivities.filter(a => a.project_id === projectId);
        const reports = mockProgressReports.filter(r => r.project_id === projectId);
        
        const totalActivities = activities.length;
        const completedActivities = activities.filter(a => a.executed_qty >= a.boq_qty).length;
        const totalProgress = activities.reduce((sum, a) => sum + a.executed_qty, 0);
        const totalBOQ = activities.reduce((sum, a) => sum + a.boq_qty, 0);
        const completionPercentage = totalBOQ > 0 ? (totalProgress / totalBOQ) * 100 : 0;
        
        const averageDailyProgress = reports.length > 0 
          ? reports.reduce((sum, r) => sum + r.total_progress, 0) / reports.length 
          : 0;

        return {
          total_activities: totalActivities,
          completed_activities: completedActivities,
          total_progress: totalProgress,
          average_daily_progress: averageDailyProgress,
          completion_percentage: completionPercentage
        } as ProjectSummary;
      }
      
      // Get total activities
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('id, boq_qty, executed_qty')
        .eq('project_id', projectId)
        .eq('is_active', true);
      
      if (activitiesError) throw activitiesError;

      // Get daily progress for average calculation
      const { data: dailyProgress, error: progressError } = await supabase
        .from('progress_reports')
        .select('total_progress, date')
        .eq('project_id', projectId)
        .eq('status', 'approved')
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (progressError) throw progressError;

      const totalActivities = activities.length;
      const completedActivities = activities.filter(a => a.executed_qty >= a.boq_qty).length;
      const totalProgress = activities.reduce((sum, a) => sum + a.executed_qty, 0);
      const totalBOQ = activities.reduce((sum, a) => sum + a.boq_qty, 0);
      const completionPercentage = totalBOQ > 0 ? (totalProgress / totalBOQ) * 100 : 0;
      
      const averageDailyProgress = dailyProgress.length > 0 
        ? dailyProgress.reduce((sum, dp) => sum + dp.total_progress, 0) / dailyProgress.length 
        : 0;

      return {
        total_activities: totalActivities,
        completed_activities: completedActivities,
        total_progress: totalProgress,
        average_daily_progress: averageDailyProgress,
        completion_percentage: completionPercentage
      } as ProjectSummary;
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
      const { data, error } = await supabase.functions.invoke('generate-pdf-report', {
        body: {
          project_id: projectId,
          report_type: reportType,
          date_range: dateRange,
          include_charts: true
        }
      });

      if (error) throw error;

      // Download the generated PDF
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
      // Create CSV content
      const reportsCSV = [
        'Fecha,Turno,Reportero,Estado,Actividades,Progreso,Notas',
        ...historicalReports.map(report => [
          report.date,
          report.shift,
          report.reporter?.full_name || report.reporter?.email || 'N/A',
          report.status,
          report.total_activities,
          report.total_progress,
          report.notes || ''
        ].join(','))
      ].join('\n');

      const activitiesCSV = [
        'Código,Actividad,Unidad,BOQ,Ejecutado,Progreso%,Última Actualización',
        ...activityProgress.map(activity => [
          activity.activity_code,
          activity.activity_name,
          activity.unit,
          activity.boq_qty,
          activity.total_executed,
          activity.progress_percentage,
          new Date(activity.last_updated).toLocaleDateString()
        ].join(','))
      ].join('\n');

      // Create zip file with both CSVs
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
    const totalProgress = historicalReports.reduce((sum, r) => sum + r.total_progress, 0);

    return {
      total,
      approved,
      rejected,
      pending,
      totalProgress,
      averageProgress: total > 0 ? totalProgress / total : 0
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
