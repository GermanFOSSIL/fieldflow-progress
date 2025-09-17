import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mockProjects, mockActivities, mockProgressReports, mockDashboardMetrics } from '@/lib/mock-data';
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
      
      // Get projects count
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, status');
      
      if (projectsError) throw projectsError;

      // Get activities count
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('id, executed_qty, boq_qty, is_active');
      
      if (activitiesError) throw activitiesError;

      // Get reports count
      const { data: reports, error: reportsError } = await supabase
        .from('progress_reports')
        .select('id, status');
      
      if (reportsError) throw reportsError;

      // Get team members count
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id');
      
      if (usersError) throw usersError;

      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const totalActivities = activities.filter(a => a.is_active).length;
      const completedActivities = activities.filter(a => a.executed_qty >= a.boq_qty).length;
      const totalProgress = activities.reduce((sum, a) => sum + a.executed_qty, 0);
      const pendingReports = reports.filter(r => r.status === 'submitted').length;
      const approvedReports = reports.filter(r => r.status === 'approved').length;
      const teamMembers = users.length;

      return {
        total_projects: totalProjects,
        active_projects: activeProjects,
        total_activities: totalActivities,
        completed_activities: completedActivities,
        total_progress: totalProgress,
        pending_reports: pendingReports,
        approved_reports: approvedReports,
        team_members: teamMembers
      } as DashboardMetrics;
    }
  });

  // Fetch project summaries
  const { data: projectSummaries, isLoading: projectsLoading } = useQuery({
    queryKey: ['project-summaries'],
    queryFn: async () => {
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          code,
          status,
          created_at
        `)
        .order('created_at', { ascending: false });
      
      if (projectsError) throw projectsError;

      // Get activities for each project
      const projectSummaries = await Promise.all(
        projects.map(async (project) => {
          const { data: activities, error: activitiesError } = await supabase
            .from('activities')
            .select('id, executed_qty, boq_qty, updated_at')
            .eq('project_id', project.id)
            .eq('is_active', true);
          
          if (activitiesError) throw activitiesError;

          const totalActivities = activities.length;
          const completedActivities = activities.filter(a => a.executed_qty >= a.boq_qty).length;
          const totalProgress = activities.reduce((sum, a) => sum + a.executed_qty, 0);
          const totalBOQ = activities.reduce((sum, a) => sum + a.boq_qty, 0);
          const progressPercentage = totalBOQ > 0 ? (totalProgress / totalBOQ) * 100 : 0;
          
          const lastActivityDate = activities.length > 0 
            ? activities.reduce((latest, a) => 
                new Date(a.updated_at) > new Date(latest) ? a.updated_at : latest, 
                activities[0].updated_at
              )
            : project.created_at;

          // Get team size for project
          const { data: teamMembers, error: teamError } = await supabase
            .from('project_members')
            .select('user_id')
            .eq('project_id', project.id);
          
          const teamSize = teamMembers?.length || 0;

          return {
            id: project.id,
            name: project.name,
            code: project.code,
            status: project.status,
            progress_percentage: progressPercentage,
            total_activities: totalActivities,
            completed_activities: completedActivities,
            last_activity_date: lastActivityDate,
            team_size: teamSize
          } as ProjectSummary;
        })
      );

      return projectSummaries;
    }
  });

  // Fetch recent activities
  const { data: recentActivities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      // Get recent reports
      const { data: reports, error: reportsError } = await supabase
        .from('progress_reports')
        .select(`
          id,
          status,
          created_at,
          reporter:users(email, full_name),
          project:projects(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (reportsError) throw reportsError;

      const activities: RecentActivity[] = reports.map(report => ({
        id: report.id,
        type: report.status === 'submitted' ? 'report' : 'approval',
        title: report.status === 'submitted' ? 'Nuevo Reporte Enviado' : 'Reporte Aprobado',
        description: `Reporte del proyecto ${report.project?.name}`,
        user_name: report.reporter?.full_name || report.reporter?.email || 'Usuario',
        timestamp: report.created_at,
        project_name: report.project?.name || 'Proyecto'
      }));

      return activities;
    }
  });

  // Fetch team performance
  const { data: teamPerformance, isLoading: teamLoading } = useQuery({
    queryKey: ['team-performance'],
    queryFn: async () => {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          role
        `);
      
      if (usersError) throw usersError;

      const teamPerformance = await Promise.all(
        users.map(async (user) => {
          // Get user's reports
          const { data: reports, error: reportsError } = await supabase
            .from('progress_reports')
            .select('total_progress, created_at')
            .eq('user_id', user.id)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
          
          if (reportsError) throw reportsError;

          const reportsCount = reports.length;
          const averageProgress = reports.length > 0 
            ? reports.reduce((sum, r) => sum + r.total_progress, 0) / reports.length 
            : 0;
          const lastActivity = reports.length > 0 
            ? reports.reduce((latest, r) => 
                new Date(r.created_at) > new Date(latest) ? r.created_at : latest, 
                reports[0].created_at
              )
            : user.created_at;

          return {
            user_id: user.id,
            user_name: user.full_name || user.email,
            email: user.email,
            role: user.role,
            reports_count: reportsCount,
            average_progress: averageProgress,
            last_activity: lastActivity
          } as TeamPerformance;
        })
      );

      return teamPerformance.sort((a, b) => b.reports_count - a.reports_count);
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
