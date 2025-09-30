import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mockDashboardMetrics } from '@/lib/mock-data';
import { useSupabaseConnection } from './useSupabaseConnection';

interface DashboardMetrics {
  total_projects: number;
  active_projects: number;
  total_activities: number;
  completed_activities: number;
  total_progress: number;
  pending_reports: number;
  approved_reports: number;
  team_members: number;
}

interface ProjectSummary {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'completed' | 'on-hold';
  progress_percentage: number;
  total_activities: number;
  completed_activities: number;
  last_activity_date: string;
  team_size: number;
}

interface RecentActivity {
  id: string;
  type: 'report' | 'approval' | 'activity' | 'import';
  title: string;
  description: string;
  user_name: string;
  timestamp: string;
  project_name: string;
}

interface TeamPerformance {
  user_id: string;
  user_name: string;
  email: string;
  role: string;
  reports_count: number;
  average_progress: number;
  last_activity: string;
}

export function useDashboard() {
  const { isConnected } = useSupabaseConnection();
  
  // Fetch dashboard metrics
  const { data: dashboardMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      if (!isConnected) {
        return mockDashboardMetrics as DashboardMetrics;
      }
      
      try {
        // Get projects count
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('id, status');
        
        if (projectsError) throw projectsError;

        // Get activities count and progress
        const { data: activities, error: activitiesError } = await supabase
          .from('activities')
          .select('id, boq_qty, weight');
        
        if (activitiesError) throw activitiesError;

        // Get activity progress aggregation
        const { data: activityProgress, error: progressError } = await supabase
          .from('activity_progress_agg')
          .select('activity_id, qty_accum, pct');
        
        if (progressError) throw progressError;

        // Get reports count
        const { data: reports, error: reportsError } = await supabase
          .from('daily_reports')
          .select('id, status');
        
        if (reportsError) throw reportsError;

        // Get team members count
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id');
        
        if (usersError) throw usersError;

        const totalProjects = projects?.length || 0;
        const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
        const totalActivities = activities?.length || 0;
        
        // Calculate completed activities based on progress percentage
        const completedActivities = activityProgress?.filter(ap => ap.pct >= 1.0).length || 0;
        
        // Calculate total progress as sum of all accumulated quantities
        const totalProgress = activityProgress?.reduce((sum, ap) => sum + (ap.qty_accum || 0), 0) || 0;
        
        const pendingReports = reports?.filter(r => r.status === 'submitted').length || 0;
        const approvedReports = reports?.filter(r => r.status === 'approved').length || 0;
        const teamMembers = users?.length || 0;

        return {
          total_projects: totalProjects,
          active_projects: activeProjects,
          total_activities: totalActivities,
          completed_activities: completedActivities,
          total_progress: Math.round(totalProgress),
          pending_reports: pendingReports,
          approved_reports: approvedReports,
          team_members: teamMembers
        } as DashboardMetrics;
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        return mockDashboardMetrics as DashboardMetrics;
      }
    }
  });

  // Fetch project summaries
  const { data: projectSummaries, isLoading: projectsLoading } = useQuery({
    queryKey: ['project-summaries'],
    queryFn: async () => {
      if (!isConnected) return [];
      
      try {
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('id, name, code, status, created_at')
          .order('created_at', { ascending: false });
        
        if (projectsError) throw projectsError;

        // For simplicity, return basic project data
        // In production, you'd fetch related activities and team members
        const projectSummaries: ProjectSummary[] = projects?.map(project => ({
          id: project.id,
          name: project.name,
          code: project.code,
          status: project.status as 'active' | 'completed' | 'on-hold',
          progress_percentage: 0,
          total_activities: 0,
          completed_activities: 0,
          last_activity_date: project.created_at,
          team_size: 0
        })) || [];

        return projectSummaries;
      } catch (error) {
        console.error('Error fetching project summaries:', error);
        return [];
      }
    }
  });

  // Fetch recent activities
  const { data: recentActivities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      if (!isConnected) return [];
      
      try {
        // Get recent reports
        const { data: reports, error: reportsError } = await supabase
          .from('daily_reports')
          .select('id, status, created_at, reporter_id, project_id')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (reportsError) throw reportsError;

        const activities: RecentActivity[] = reports?.map(report => ({
          id: report.id,
          type: report.status === 'submitted' ? 'report' as const : 'approval' as const,
          title: report.status === 'submitted' ? 'Nuevo Reporte Enviado' : 'Reporte Aprobado',
          description: `Reporte del proyecto`,
          user_name: 'Usuario',
          timestamp: report.created_at,
          project_name: 'Proyecto'
        })) || [];

        return activities;
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        return [];
      }
    }
  });

  // Fetch team performance
  const { data: teamPerformance, isLoading: teamLoading } = useQuery({
    queryKey: ['team-performance'],
    queryFn: async () => {
      if (!isConnected) return [];
      
      try {
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, full_name, role');
        
        if (usersError) throw usersError;

        const teamPerformance: TeamPerformance[] = users?.map(user => ({
          user_id: user.id,
          user_name: user.full_name || 'Usuario',
          email: '',
          role: user.role,
          reports_count: 0,
          average_progress: 0,
          last_activity: new Date().toISOString()
        })) || [];

        return teamPerformance;
      } catch (error) {
        console.error('Error fetching team performance:', error);
        return [];
      }
    }
  });

  return {
    dashboardMetrics,
    projectSummaries,
    recentActivities,
    teamPerformance,
    metricsLoading,
    projectsLoading,
    activitiesLoading,
    teamLoading
  };
}
