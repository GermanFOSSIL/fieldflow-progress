import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImportedActivity {
  project_code: string;
  area_name: string;
  system_name: string;
  activity_code: string;
  activity_name: string;
  unit: string;
  boq_qty: number;
  weight: number;
  status: 'valid' | 'warning' | 'error';
  error_message?: string;
}

interface ImportResult {
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  activities: ImportedActivity[];
}

export function useImportPlan() {
  const queryClient = useQueryClient();
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Parse CSV file
  const parseCSV = (csvText: string): ImportedActivity[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const activities: ImportedActivity[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length < headers.length) continue;
      
      const activity: ImportedActivity = {
        project_code: values[0] || '',
        area_name: values[1] || '',
        system_name: values[2] || '',
        activity_code: values[3] || '',
        activity_name: values[4] || '',
        unit: values[5] || '',
        boq_qty: parseFloat(values[6]) || 0,
        weight: parseFloat(values[7]) || 0,
        status: 'valid'
      };

      // Validate activity
      if (!activity.activity_code || !activity.activity_name) {
        activity.status = 'error';
        activity.error_message = 'Código y nombre de actividad son requeridos';
      } else if (activity.boq_qty <= 0) {
        activity.status = 'warning';
        activity.error_message = 'Cantidad BOQ debe ser mayor a 0';
      } else if (activity.weight <= 0) {
        activity.status = 'warning';
        activity.error_message = 'Peso debe ser mayor a 0';
      }

      activities.push(activity);
    }
    
    return activities;
  };

  // Import activities mutation
  const importActivitiesMutation = useMutation({
    mutationFn: async (activities: ImportedActivity[]) => {
      const validActivities = activities.filter(a => a.status === 'valid');
      
      if (validActivities.length === 0) {
        throw new Error('No hay actividades válidas para importar');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Get project ID from first activity
      const projectCode = validActivities[0].project_code;
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('code', projectCode)
        .single();

      if (!project) {
        throw new Error(`Proyecto con código ${projectCode} no encontrado`);
      }

      // Insert activities
      const activitiesToInsert = validActivities.map(activity => ({
        project_id: project.id,
        code: activity.activity_code,
        name: activity.activity_name,
        unit: activity.unit,
        boq_qty: activity.boq_qty,
        weight: activity.weight,
        area_name: activity.area_name,
        system_name: activity.system_name,
        is_active: true,
        created_by: user.id
      }));

      const { data, error } = await supabase
        .from('activities')
        .insert(activitiesToInsert)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success(`${data.length} actividades importadas correctamente`);
    },
    onError: (error) => {
      console.error('Error importing activities:', error);
      toast.error(`Error al importar: ${error.message}`);
    }
  });

  // Process file upload
  const processFile = async (file: File): Promise<ImportResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          const activities = parseCSV(csvText);
          
          const result: ImportResult = {
            totalRows: activities.length,
            validRows: activities.filter(a => a.status === 'valid').length,
            warningRows: activities.filter(a => a.status === 'warning').length,
            errorRows: activities.filter(a => a.status === 'error').length,
            activities
          };
          
          setImportResult(result);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file);
    });
  };

  // Import valid activities
  const importValidActivities = async () => {
    if (!importResult) return;
    
    const validActivities = importResult.activities.filter(a => a.status === 'valid');
    await importActivitiesMutation.mutateAsync(validActivities);
  };

  // Download template
  const downloadTemplate = () => {
    const template = [
      'project_code,area_name,system_name,activity_code,activity_name,unit,boq_qty,weight',
      'FP01,Área 1,Sistema Proceso,A-0001,Soldadura spool 2",u,120,0.20',
      'FP01,Área 1,Sistema Eléctrico,A-0101,Tendido bandeja principal,m,200,0.25',
      'FP01,Área 2,Sistema Instrumentos,A-0205,Instalación transmisores,u,40,0.15'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activities_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    importResult,
    processFile,
    importValidActivities,
    downloadTemplate,
    isImporting: importActivitiesMutation.isPending,
    isProcessing: false
  };
}

