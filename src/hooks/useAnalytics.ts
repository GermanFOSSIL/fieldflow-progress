import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mockActivities, mockProgressReports, mockProgressEntries } from '@/lib/mock-data';
import { useSupabaseConnection } from './useSupabaseConnection';

interface ProjectMetrics {
  total_activities: number;
  completed_activities: number;
  total_progress: number;
  completion_percentage: number;
  average_daily_progress: number;
  estimated_completion_date: string;
  risk_level: 'low' | 'medium' | 'high';
}

interface ActivityTrend {
  date: string;
  progress: number;
  activities_completed: number;
}

interface PerformanceMetrics {
  productivity_score: number;
  quality_score: number;
  efficiency_ratio: number;
  team_performance: {
    user_id: string;
    user_name: string;
    reports_count: number;
    average_progress: number;
    quality_score: number;
  }[];
}

interface PredictiveData {
  forecasted_completion: string;
  confidence_level: number;
  risk_factors: string[];
  recommendations: string[];
}

export function useAnalytics(projectId?: string) {
  const { isConnected } = useSupabaseConnection();
  
  // Fetch project metrics
  const { data: projectMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['project-metrics', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      // Siempre usar datos mock por ahora ya que Supabase no está disponible
      if (true || !isConnected) {
        // Usar datos mock para analytics
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

        // Calcular fecha estimada de finalización
        const estimatedCompletionDate = new Date();
        estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + Math.ceil((100 - completionPercentage) / averageDailyProgress));

        return {
          total_activities: totalActivities,
          completed_activities: completedActivities,
          total_progress: totalProgress,
          completion_percentage: completionPercentage,
          average_daily_progress: averageDailyProgress,
          estimated_completion_date: estimatedCompletionDate.toISOString().split('T')[0],
          risk_level: completionPercentage < 30 ? 'high' : completionPercentage < 70 ? 'medium' : 'low'
        } as ProjectMetrics;
      }
      
      // Get activities data
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('id, boq_qty, executed_qty, progress_percentage')
        .eq('project_id', projectId)
        .eq('is_active', true);
      
      if (activitiesError) throw activitiesError;

      // Get daily progress data
      const { data: dailyProgress, error: progressError } = await supabase
        .from('progress_reports')
        .select('total_progress, date')
        .eq('project_id', projectId)
        .eq('status', 'approved')
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: true });
      
      if (progressError) throw progressError;

      // If there are no activities in DB, fallback to demo metrics
      if (!activities || activities.length === 0) {
        const demoActivities = mockActivities;
        const demoReports = mockProgressReports;
        const totalActivitiesDemo = demoActivities.length;
        const completedActivitiesDemo = demoActivities.filter(a => a.executed_qty >= a.boq_qty).length;
        const totalProgressDemo = demoActivities.reduce((sum, a) => sum + a.executed_qty, 0);
        const totalBOQDemo = demoActivities.reduce((sum, a) => sum + a.boq_qty, 0);
        const completionPercentageDemo = totalBOQDemo > 0 ? (totalProgressDemo / totalBOQDemo) * 100 : 0;
        const avgDailyDemo = demoReports.length > 0 ? demoReports.reduce((s, r) => s + r.total_progress, 0) / demoReports.length : 0;
        const date = new Date();
        if (avgDailyDemo > 0) {
          date.setDate(date.getDate() + Math.ceil((100 - completionPercentageDemo) / avgDailyDemo));
        }
        return {
          total_activities: totalActivitiesDemo,
          completed_activities: completedActivitiesDemo,
          total_progress: totalProgressDemo,
          completion_percentage: completionPercentageDemo,
          average_daily_progress: avgDailyDemo,
          estimated_completion_date: date.toISOString().split('T')[0],
          risk_level: completionPercentageDemo < 30 ? 'high' : completionPercentageDemo < 70 ? 'medium' : 'low'
        } as ProjectMetrics;
      }

      const totalActivities = activities.length;
      const completedActivities = activities.filter(a => a.executed_qty >= a.boq_qty).length;
      const totalProgress = activities.reduce((sum, a) => sum + a.executed_qty, 0);
      const totalBOQ = activities.reduce((sum, a) => sum + a.boq_qty, 0);
      const completionPercentage = totalBOQ > 0 ? (totalProgress / totalBOQ) * 100 : 0;
      
      const averageDailyProgress = dailyProgress.length > 0 
        ? dailyProgress.reduce((sum, dp) => sum + dp.total_progress, 0) / dailyProgress.length 
        : 0;

      // Calculate estimated completion date
      const remainingProgress = totalBOQ - totalProgress;
      const estimatedDays = averageDailyProgress > 0 ? Math.ceil(remainingProgress / averageDailyProgress) : 0;
      const estimatedCompletionDate = new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (completionPercentage < 30) riskLevel = 'high';
      else if (completionPercentage < 60) riskLevel = 'medium';

      return {
        total_activities: totalActivities,
        completed_activities: completedActivities,
        total_progress: totalProgress,
        completion_percentage: completionPercentage,
        average_daily_progress: averageDailyProgress,
        estimated_completion_date: estimatedCompletionDate,
        risk_level: riskLevel
      } as ProjectMetrics;
    },
    enabled: !!projectId
  });

  // Fetch activity trends
  const { data: activityTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['activity-trends', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      // Siempre usar datos mock por ahora ya que Supabase no está disponible
      if (true || !isConnected) {
        // Generar datos mock para tendencias
        const trends = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          trends.push({
            date,
            progress: Math.floor(Math.random() * 20) + 5, // 5-25
            activities_completed: Math.floor(Math.random() * 5) + 1 // 1-5
          });
        }
        return trends as ActivityTrend[];
      }
      
      const { data, error } = await supabase
        .from('progress_reports')
        .select('date, total_progress, total_activities')
        .eq('project_id', projectId)
        .eq('status', 'approved')
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      return data.map(item => ({
        date: item.date,
        progress: item.total_progress,
        activities_completed: item.total_activities
      })) as ActivityTrend[];
    },
    enabled: !!projectId
  });

  // Fetch performance metrics
  const { data: performanceMetrics, isLoading: performanceLoading } = useQuery({
    queryKey: ['performance-metrics', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      // Siempre usar datos mock por ahora ya que Supabase no está disponible
      if (true || !isConnected) {
        // Datos mock para métricas de rendimiento
        return {
          productivity_score: 85.5,
          quality_score: 78.3,
          efficiency_ratio: 0.85,
          team_performance: [
            {
              user_id: 'user-1',
              user_name: 'Usuario Demo',
              reports_count: 15,
              average_progress: 12.5,
              quality_score: 85
            },
            {
              user_id: 'user-2',
              user_name: 'Ana Silva',
              reports_count: 12,
              average_progress: 10.8,
              quality_score: 78
            },
            {
              user_id: 'user-3',
              user_name: 'Carlos Rodríguez',
              reports_count: 8,
              average_progress: 8.2,
              quality_score: 72
            }
          ]
        } as PerformanceMetrics;
      }
      
      // Get team performance data
      const { data: teamData, error: teamError } = await supabase
        .from('progress_reports')
        .select(`
          user_id,
          total_progress,
          total_activities,
          reporter:users(email, full_name)
        `)
        .eq('project_id', projectId)
        .eq('status', 'approved')
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      
      if (teamError) throw teamError;

      // Calculate team performance
      const userStats = new Map();
      teamData.forEach(report => {
        const userId = report.user_id;
        if (!userStats.has(userId)) {
          userStats.set(userId, {
            user_id: userId,
            user_name: report.reporter?.full_name || report.reporter?.email || 'Usuario',
            reports_count: 0,
            total_progress: 0,
            total_activities: 0
          });
        }
        const stats = userStats.get(userId);
        stats.reports_count++;
        stats.total_progress += report.total_progress;
        stats.total_activities += report.total_activities;
      });

      const teamPerformance = Array.from(userStats.values()).map(user => ({
        ...user,
        average_progress: user.reports_count > 0 ? user.total_progress / user.reports_count : 0,
        quality_score: Math.min(100, (user.total_activities / user.reports_count) * 10) // Simple quality metric
      }));

      // Calculate overall metrics
      const totalReports = teamData.length;
      const totalProgress = teamData.reduce((sum, r) => sum + r.total_progress, 0);
      const totalActivities = teamData.reduce((sum, r) => sum + r.total_activities, 0);

      const productivityScore = totalReports > 0 ? Math.min(100, (totalProgress / totalReports) * 2) : 0;
      const qualityScore = totalReports > 0 ? Math.min(100, (totalActivities / totalReports) * 5) : 0;
      const efficiencyRatio = totalActivities > 0 ? totalProgress / totalActivities : 0;

      return {
        productivity_score: productivityScore,
        quality_score: qualityScore,
        efficiency_ratio: efficiencyRatio,
        team_performance: teamPerformance
      } as PerformanceMetrics;
    },
    enabled: !!projectId
  });

  // Fetch predictive analytics
  const { data: predictiveData, isLoading: predictiveLoading } = useQuery({
    queryKey: ['predictive-analytics', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      // Siempre usar datos mock por ahora ya que Supabase no está disponible
      if (true || !isConnected) {
        // Datos mock para análisis predictivo
        const forecastedCompletion = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        return {
          forecasted_completion: forecastedCompletion,
          confidence_level: 78,
          risk_factors: [
            'Retraso en entrega de materiales',
            'Condiciones climáticas adversas',
            'Disponibilidad de personal especializado'
          ],
          recommendations: [
            'Acelerar la entrega de materiales críticos',
            'Implementar turnos adicionales en áreas clave',
            'Establecer buffer de tiempo para imprevistos'
          ]
        } as PredictiveData;
      }
      
      if (!projectMetrics || !activityTrends) return null;
      
      // Simple predictive analysis based on current trends
      const recentTrends = activityTrends.slice(-7); // Last 7 days
      const averageRecentProgress = recentTrends.length > 0 
        ? recentTrends.reduce((sum, t) => sum + t.progress, 0) / recentTrends.length 
        : 0;

      const remainingProgress = (projectMetrics.total_activities * 100) - projectMetrics.completion_percentage;
      const estimatedDays = averageRecentProgress > 0 ? Math.ceil(remainingProgress / averageRecentProgress) : 0;
      const forecastedCompletion = new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Calculate confidence level based on data consistency
      const progressVariance = recentTrends.length > 1 
        ? recentTrends.reduce((sum, t) => sum + Math.pow(t.progress - averageRecentProgress, 2), 0) / recentTrends.length
        : 0;
      const confidenceLevel = Math.max(50, 100 - (progressVariance / 10));

      // Identify risk factors
      const riskFactors: string[] = [];
      if (projectMetrics.completion_percentage < 30) {
        riskFactors.push('Progreso inicial bajo');
      }
      if (averageRecentProgress < projectMetrics.average_daily_progress * 0.8) {
        riskFactors.push('Rendimiento reciente en declive');
      }
      if (projectMetrics.risk_level === 'high') {
        riskFactors.push('Alto riesgo de retraso');
      }

      // Generate recommendations
      const recommendations: string[] = [];
      if (projectMetrics.completion_percentage < 50) {
        recommendations.push('Acelerar el ritmo de trabajo en actividades críticas');
      }
      if (averageRecentProgress < projectMetrics.average_daily_progress) {
        recommendations.push('Revisar y optimizar procesos de trabajo');
      }
      if (riskFactors.length > 0) {
        recommendations.push('Implementar medidas de mitigación de riesgos');
      }
      if (recommendations.length === 0) {
        recommendations.push('Mantener el ritmo actual de trabajo');
      }

      return {
        forecasted_completion: forecastedCompletion,
        confidence_level: confidenceLevel,
        risk_factors: riskFactors,
        recommendations: recommendations
      } as PredictiveData;
    },
    enabled: !!projectId && !!projectMetrics && !!activityTrends
  });

  return {
    projectMetrics,
    activityTrends,
    performanceMetrics,
    predictiveData,
    metricsLoading,
    trendsLoading,
    performanceLoading,
    predictiveLoading
  };
}