import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProgressData {
  week: string;
  planned: number;
  actual: number;
}

interface SystemAnalytic {
  id: string;
  name: string;
  planned: number;
  actual: number;
  efficiency: number;
  trend: 'up' | 'down' | 'stable';
  activities: number;
  completedActivities: number;
}

interface OverallKPIs {
  plannedProgress: number;
  actualProgress: number;
  efficiency: number;
  totalActivities: number;
  completedActivities: number;
}

export function useAnalytics() {
  // Fetch projects for analysis
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch activities with progress
  const { data: activitiesData } = useQuery({
    queryKey: ['activities-with-progress'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          work_packages:work_package_id (
            name,
            code,
            subsystems:subsystem_id (
              name,
              systems:system_id (
                name,
                code,
                areas:area_id (
                  name,
                  projects:project_id (name)
                )
              )
            )
          ),
          activity_progress_agg (qty_accum, pct)
        `);
      
      if (error) throw error;
      return data;
    }
  });

  // Calculate overall KPIs
  const overallKPIs: OverallKPIs = {
    plannedProgress: 75, // This would be calculated from project schedules
    actualProgress: activitiesData ? 
      activitiesData.reduce((sum, activity) => {
        const progress = activity.activity_progress_agg?.[0]?.pct || 0;
        return sum + (progress * activity.weight);
      }, 0) / activitiesData.length * 100 : 0,
    efficiency: 0,
    totalActivities: activitiesData?.length || 0,
    completedActivities: activitiesData?.filter(activity => {
      const progress = activity.activity_progress_agg?.[0]?.pct || 0;
      return progress >= 1.0;
    }).length || 0
  };

  overallKPIs.efficiency = overallKPIs.plannedProgress > 0 ? 
    (overallKPIs.actualProgress / overallKPIs.plannedProgress) * 100 : 0;

  // Calculate system analytics
  const systemAnalytics: SystemAnalytic[] = [];
  
  if (activitiesData) {
    const systemMap = new Map();
    
    activitiesData.forEach(activity => {
      const system = activity.work_packages?.subsystems?.systems;
      if (!system) return;
      
      const systemId = system.code;
      if (!systemMap.has(systemId)) {
        systemMap.set(systemId, {
          id: systemId,
          name: system.name,
          activities: [],
          totalWeight: 0,
          actualProgress: 0
        });
      }
      
      const systemData = systemMap.get(systemId);
      systemData.activities.push(activity);
      systemData.totalWeight += activity.weight;
      
      const progress = activity.activity_progress_agg?.[0]?.pct || 0;
      systemData.actualProgress += progress * activity.weight;
    });
    
    systemMap.forEach((systemData, systemId) => {
      const avgProgress = systemData.totalWeight > 0 ? 
        (systemData.actualProgress / systemData.totalWeight) * 100 : 0;
      
      systemAnalytics.push({
        id: systemId,
        name: systemData.name,
        planned: 75, // Would be from schedule
        actual: avgProgress,
        efficiency: avgProgress / 75 * 100,
        trend: avgProgress > 70 ? 'up' : avgProgress > 40 ? 'stable' : 'down',
        activities: systemData.activities.length,
        completedActivities: systemData.activities.filter((a: any) => {
          const progress = a.activity_progress_agg?.[0]?.pct || 0;
          return progress >= 1.0;
        }).length
      });
    });
  }

  // Generate S-curve data (simulated weekly progress)
  const progressData: ProgressData[] = [];
  for (let week = 1; week <= 12; week++) {
    const plannedCumulative = Math.min(week * 8.33, 100); // Linear to 100% over 12 weeks
    const actualCumulative = Math.min(
      week * 6.25 + Math.random() * 10 - 5, // With some variance
      overallKPIs.actualProgress
    );
    
    progressData.push({
      week: `Sem ${week}`,
      planned: Math.round(plannedCumulative),
      actual: Math.round(Math.max(0, actualCumulative))
    });
  }

  return {
    overallKPIs,
    systemAnalytics,
    progressData,
    projects,
    isLoading: !activitiesData
  };
}