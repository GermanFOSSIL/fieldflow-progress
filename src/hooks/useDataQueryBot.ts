import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QueryResult {
  type: 'success' | 'error' | 'empty';
  data?: any[];
  message: string;
  query?: string;
}

interface DataQueryResponse {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'bot';
  type: 'data_query';
  metadata?: {
    query: string;
    results: any[];
    queryType: string;
    formattedResults: string;
  };
}

export function useDataQueryBot() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processDataQuery = async (message: string, projectId?: string): Promise<DataQueryResponse> => {
    setIsProcessing(true);
    
    try {
      const queryIntent = analyzeQueryIntent(message);
      const result = await executeQuery(queryIntent, message, projectId);
      
      return {
        id: Date.now().toString(),
        text: formatQueryResponse(result, queryIntent),
        timestamp: new Date(),
        sender: 'bot',
        type: 'data_query',
        metadata: {
          query: message,
          results: result.data || [],
          queryType: queryIntent.type,
          formattedResults: formatQueryResponse(result, queryIntent)
        }
      };
    } catch (error) {
      console.error('Error processing data query:', error);
      return {
        id: Date.now().toString(),
        text: '❌ **Error en Consulta**\n\nHubo un problema al procesar tu consulta. Por favor intenta de nuevo o reformula tu pregunta.',
        timestamp: new Date(),
        sender: 'bot',
        type: 'data_query'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeQueryIntent = (message: string) => {
    const text = message.toLowerCase();
    
    // Progress/Avance queries
    if (text.includes('avance') || text.includes('progreso') || text.includes('estado') || text.includes('porcentaje')) {
      if (text.includes('actividad') || text.includes('tarea')) {
        return { type: 'activity_progress', entity: extractEntity(message, 'activity') };
      }
      if (text.includes('proyecto')) {
        return { type: 'project_progress', entity: extractEntity(message, 'project') };
      }
      return { type: 'general_progress', entity: null };
    }

    // Inventory/Materials queries
    if (text.includes('inventario') || text.includes('material') || text.includes('stock') || text.includes('cemento') || text.includes('acero')) {
      return { type: 'inventory', entity: extractEntity(message, 'material') };
    }

    // Reports queries
    if (text.includes('reporte') || text.includes('informe') || text.includes('quien reporto') || text.includes('últimos reportes')) {
      if (text.includes('hoy') || text.includes('today')) {
        return { type: 'daily_reports', entity: 'today' };
      }
      if (text.includes('semana') || text.includes('week')) {
        return { type: 'weekly_reports', entity: 'week' };
      }
      return { type: 'recent_reports', entity: null };
    }

    // Staff/Personnel queries
    if (text.includes('personal') || text.includes('trabajador') || text.includes('supervisor') || text.includes('quien')) {
      return { type: 'personnel', entity: extractEntity(message, 'person') };
    }

    // Problems/Alerts queries
    if (text.includes('problema') || text.includes('alerta') || text.includes('issue') || text.includes('pendiente')) {
      return { type: 'alerts', entity: null };
    }

    // System/Package queries
    if (text.includes('sistema') || text.includes('paquete')) {
      return { type: 'systems', entity: extractEntity(message, 'system') };
    }

    // Default to general query
    return { type: 'general', entity: null };
  };

  const extractEntity = (message: string, type: string): string | null => {
    // Simple entity extraction - could be enhanced with NLP
    const words = message.toLowerCase().split(' ');
    
    switch (type) {
      case 'activity':
        const activityKeywords = ['fundacion', 'estructura', 'electrico', 'sanitario', 'terminacion'];
        return words.find(word => activityKeywords.some(keyword => word.includes(keyword))) || null;
      
      case 'material':
        const materialKeywords = ['cemento', 'acero', 'ladrillo', 'arena', 'agregado'];
        return words.find(word => materialKeywords.some(keyword => word.includes(keyword))) || null;
      
      case 'project':
        const projectKeywords = ['proj', 'proyecto'];
        const projectIndex = words.findIndex(word => projectKeywords.some(keyword => word.includes(keyword)));
		return projectIndex !== -1 && projectIndex < words.length - 1 ? words[projectIndex + 1] : null;
      
      default:
        return null;
    }
  };

  const executeQuery = async (queryIntent: any, originalMessage: string, projectId?: string): Promise<QueryResult> => {
    try {
      switch (queryIntent.type) {
        case 'activity_progress':
        case 'general_progress':
          return await queryActivityProgress(queryIntent.entity, projectId);
        
        case 'project_progress':
          return await queryProjectProgress(projectId);
        
        case 'inventory':
          return await queryInventory(queryIntent.entity);
        
        case 'daily_reports':
          return await queryDailyReports('today', projectId);
        
        case 'weekly_reports':
          return await queryDailyReports('week', projectId);
        
        case 'recent_reports':
          return await queryDailyReports('recent', projectId);
        
        case 'personnel':
          return await queryPersonnel();
        
        case 'alerts':
          return await queryAlerts(projectId);
        
        case 'systems':
          return await querySystems(queryIntent.entity);
        
        default:
          return await queryGeneral(originalMessage, projectId);
      }
    } catch (error) {
      console.error('Query execution error:', error);
      return {
        type: 'error',
        message: 'Error al ejecutar la consulta'
      };
    }
  };

  const queryActivityProgress = async (activityName?: string, projectId?: string): Promise<QueryResult> => {
    let query = supabase
      .from('activities')
      .select(`
        id, name, code, boq_qty, unit,
        activity_progress_agg (
          qty_accum, pct, last_updated
        ),
        work_packages (
          name, contractor
        )
      `);

    if (activityName) {
      query = query.ilike('name', `%${activityName}%`);
    }

    const { data, error } = await query.limit(10);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        type: 'empty',
        message: activityName 
          ? `No se encontraron actividades que contengan "${activityName}"`
          : 'No hay actividades registradas'
      };
    }

    return {
      type: 'success',
      data,
      message: `Encontradas ${data.length} actividades`
    };
  };

  const queryProjectProgress = async (projectId?: string): Promise<QueryResult> => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id, name, code, status,
        activities (
          id, name,
          activity_progress_agg (
            pct
          )
        )
      `)
      .eq('status', 'active')
      .limit(5);

    if (error) throw error;

    return {
      type: 'success',
      data,
      message: `Información de ${data?.length || 0} proyectos`
    };
  };

  const queryInventory = async (materialName?: string): Promise<QueryResult> => {
    // Since inventory isn't in the schema, we'll simulate it
    const mockInventory = [
      { name: 'Cemento', quantity: 245, unit: 'sacos', status: 'available' },
      { name: 'Acero', quantity: 12, unit: 'toneladas', status: 'available' },
      { name: 'Agregados', quantity: 150, unit: 'm³', status: 'available' },
      { name: 'Ladrillos', quantity: 50, unit: 'millares', status: 'low' },
      { name: 'Arena', quantity: 25, unit: 'm³', status: 'low' }
    ];

    let filteredData = mockInventory;
    if (materialName) {
      filteredData = mockInventory.filter(item => 
        item.name.toLowerCase().includes(materialName.toLowerCase())
      );
    }

    return {
      type: 'success',
      data: filteredData,
      message: `Información de inventario`
    };
  };

  const queryDailyReports = async (timeframe: string, projectId?: string): Promise<QueryResult> => {
    let query = supabase
      .from('daily_reports')
      .select(`
        id, report_date, status, shift, notes,
        users!daily_reports_reporter_id_fkey (
          full_name
        ),
        progress_entries (
          qty_today,
          activities (
            name, unit
          )
        )
      `);

    const now = new Date();
    if (timeframe === 'today') {
      const today = now.toISOString().split('T')[0];
      query = query.eq('report_date', today);
    } else if (timeframe === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      query = query.gte('report_date', weekAgo.toISOString().split('T')[0]);
    }

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query
      .order('report_date', { ascending: false })
      .limit(10);

    if (error) throw error;

    return {
      type: 'success',
      data,
      message: `Reportes encontrados: ${data?.length || 0}`
    };
  };

  const queryPersonnel = async (): Promise<QueryResult> => {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, role')
      .limit(20);

    if (error) throw error;

    return {
      type: 'success',
      data,
      message: `Personal registrado: ${data?.length || 0}`
    };
  };

  const queryAlerts = async (projectId?: string): Promise<QueryResult> => {
    let query = supabase
      .from('daily_reports')
      .select(`
        id, report_date, notes, status,
        users!daily_reports_reporter_id_fkey (
          full_name
        )
      `)
      .eq('status', 'sent') // Assuming 'sent' might indicate pending issues
      .is('approved_at', null);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return {
      type: 'success',
      data,
      message: `Alertas pendientes: ${data?.length || 0}`
    };
  };

  const querySystems = async (systemName?: string): Promise<QueryResult> => {
    let query = supabase
      .from('systems')
      .select(`
        id, name, code,
        areas (
          name
        ),
        subsystems (
          id, name, code
        )
      `);

    if (systemName) {
      query = query.ilike('name', `%${systemName}%`);
    }

    const { data, error } = await query.limit(10);

    if (error) throw error;

    return {
      type: 'success',
      data,
      message: `Sistemas encontrados: ${data?.length || 0}`
    };
  };

  const queryGeneral = async (message: string, projectId?: string): Promise<QueryResult> => {
    return {
      type: 'empty',
      message: 'No entendí tu consulta. Intenta preguntar sobre: avances, materiales, reportes, personal, problemas o sistemas.'
    };
  };

  const formatQueryResponse = (result: QueryResult, queryIntent: any): string => {
    if (result.type === 'error') {
      return `❌ **Error**\n\n${result.message}`;
    }

    if (result.type === 'empty') {
      return `ℹ️ **Sin Resultados**\n\n${result.message}`;
    }

    const data = result.data || [];
    let response = `📊 **Consulta de Datos**\n\n`;

    switch (queryIntent.type) {
      case 'activity_progress':
      case 'general_progress':
        response += `🏗️ **Avance de Actividades**\n\n`;
        data.forEach((activity: any) => {
          const progress = activity.activity_progress_agg?.[0];
          const percentage = progress ? Math.round(progress.pct * 100) : 0;
          const emoji = percentage >= 80 ? '🟢' : percentage >= 50 ? '🟡' : '🔴';
          response += `${emoji} **${activity.name}**\n`;
          response += `   • Avance: ${percentage}%\n`;
          response += `   • Cantidad: ${progress?.qty_accum || 0} / ${activity.boq_qty} ${activity.unit}\n`;
          if (activity.work_packages?.[0]) {
            response += `   • Contratista: ${activity.work_packages[0].contractor || 'N/A'}\n`;
          }
          response += '\n';
        });
        break;

      case 'project_progress':
        response += `🏢 **Estado de Proyectos**\n\n`;
        data.forEach((project: any) => {
          const activities = project.activities || [];
          const totalActivities = activities.length;
          const avgProgress = activities.reduce((sum: number, act: any) => {
            return sum + (act.activity_progress_agg?.[0]?.pct || 0);
          }, 0) / Math.max(totalActivities, 1);
          const percentage = Math.round(avgProgress * 100);
          
          response += `📁 **${project.name}** (${project.code})\n`;
          response += `   • Avance General: ${percentage}%\n`;
          response += `   • Actividades: ${totalActivities}\n`;
          response += `   • Estado: ${project.status}\n\n`;
        });
        break;

      case 'inventory':
        response += `📦 **Estado de Inventario**\n\n`;
        data.forEach((item: any) => {
          const emoji = item.status === 'available' ? '✅' : item.status === 'low' ? '⚠️' : '❌';
          response += `${emoji} **${item.name}**: ${item.quantity} ${item.unit}\n`;
        });
        const lowStock = data.filter((item: any) => item.status === 'low');
        if (lowStock.length > 0) {
          response += `\n⚠️ **Stock Bajo**: ${lowStock.length} materiales necesitan reposición\n`;
        }
        break;

      case 'daily_reports':
      case 'weekly_reports':
      case 'recent_reports':
        response += `📋 **Reportes Diarios**\n\n`;
        data.forEach((report: any) => {
          const statusEmoji = report.status === 'approved' ? '✅' : report.status === 'sent' ? '⏳' : '📝';
          response += `${statusEmoji} **${new Date(report.report_date).toLocaleDateString('es-CL')}**\n`;
          response += `   • Reportero: ${report.users?.full_name || 'N/A'}\n`;
          response += `   • Turno: ${report.shift}\n`;
          response += `   • Estado: ${report.status}\n`;
          if (report.progress_entries?.length > 0) {
            response += `   • Actividades: ${report.progress_entries.length}\n`;
          }
          response += '\n';
        });
        break;

      case 'personnel':
        response += `👥 **Personal del Proyecto**\n\n`;
        const roles = data.reduce((acc: any, person: any) => {
          acc[person.role] = (acc[person.role] || 0) + 1;
          return acc;
        }, {});
        
        Object.entries(roles).forEach(([role, count]) => {
          response += `👤 **${role}**: ${count} personas\n`;
        });
        break;

      case 'alerts':
        response += `🚨 **Alertas y Problemas**\n\n`;
        if (data.length === 0) {
          response += `✅ No hay alertas pendientes`;
        } else {
          data.forEach((alert: any) => {
            response += `⚠️ **${new Date(alert.report_date).toLocaleDateString('es-CL')}**\n`;
            response += `   • Reportado por: ${alert.users?.full_name || 'N/A'}\n`;
            if (alert.notes) {
              response += `   • Detalle: ${alert.notes.substring(0, 100)}...\n`;
            }
            response += '\n';
          });
        }
        break;

      case 'systems':
        response += `⚙️ **Sistemas del Proyecto**\n\n`;
        data.forEach((system: any) => {
          response += `🔧 **${system.name}** (${system.code})\n`;
          if (system.areas?.[0]) {
            response += `   • Área: ${system.areas[0].name}\n`;
          }
          if (system.subsystems?.length > 0) {
            response += `   • Subsistemas: ${system.subsystems.length}\n`;
          }
          response += '\n';
        });
        break;

      default:
        response += `${result.message}\n\n`;
        response += `Datos encontrados: ${data.length}`;
    }

    response += `\n\n💡 *¿Necesitas más detalles sobre algún elemento específico?*`;
    return response;
  };

  return {
    processDataQuery,
    isProcessing
  };
}