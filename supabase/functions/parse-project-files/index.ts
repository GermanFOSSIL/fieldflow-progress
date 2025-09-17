import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedActivity {
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

interface ParseResult {
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  activities: ParsedActivity[];
  fileType: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    console.log('📄 Parsing file:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Determine file type and parse accordingly
    const fileName = file.name.toLowerCase();
    let parseResult: ParseResult;

    if (fileName.endsWith('.csv')) {
      parseResult = await parseCSV(file);
    } else if (fileName.endsWith('.xer')) {
      parseResult = await parsePrimaveraXER(file);
    } else if (fileName.endsWith('.xml') && await isProjectXML(file)) {
      parseResult = await parseProjectXML(file);
    } else if (fileName.endsWith('.mpp')) {
      parseResult = await parseMSProject(file);
    } else {
      throw new Error(`Unsupported file type: ${fileName}`);
    }

    console.log('✅ Parse complete:', parseResult);

    return new Response(JSON.stringify(parseResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error parsing file:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error parsing project file',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function parseCSV(file: File): Promise<ParseResult> {
  const text = await file.text();
  const lines = text.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const activities: ParsedActivity[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    
    if (values.length < headers.length) continue;
    
    const activity: ParsedActivity = {
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
  
  return {
    totalRows: activities.length,
    validRows: activities.filter(a => a.status === 'valid').length,
    warningRows: activities.filter(a => a.status === 'warning').length,
    errorRows: activities.filter(a => a.status === 'error').length,
    activities,
    fileType: 'CSV'
  };
}

async function parsePrimaveraXER(file: File): Promise<ParseResult> {
  const text = await file.text();
  const lines = text.split('\n');
  
  const activities: ParsedActivity[] = [];
  let isActivitiesSection = false;
  let headers: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('%T\tTASK')) {
      isActivitiesSection = true;
      // Parse headers from the line
      headers = trimmedLine.split('\t').slice(2); // Remove %T and TASK
      continue;
    }
    
    if (trimmedLine.startsWith('%E')) {
      isActivitiesSection = false;
      continue;
    }
    
    if (isActivitiesSection && trimmedLine.startsWith('%R\tTASK')) {
      const values = trimmedLine.split('\t').slice(2);
      
      // Map Primavera fields to our structure
      const activity: ParsedActivity = {
        project_code: 'P6_IMPORT',
        area_name: values[findIndex(headers, 'area_name')] || 'Area Principal',
        system_name: values[findIndex(headers, 'system_name')] || 'Sistema General',
        activity_code: values[findIndex(headers, 'task_code')] || values[0] || '',
        activity_name: values[findIndex(headers, 'task_name')] || values[1] || '',
        unit: values[findIndex(headers, 'unit')] || 'u',
        boq_qty: parseFloat(values[findIndex(headers, 'budgeted_total_cost')] || '0') || 1,
        weight: parseFloat(values[findIndex(headers, 'remaining_duration')] || '0') || 0.1,
        status: 'valid'
      };
      
      // Validate
      if (!activity.activity_code || !activity.activity_name) {
        activity.status = 'error';
        activity.error_message = 'Actividad de Primavera sin código o nombre';
      }
      
      activities.push(activity);
    }
  }
  
  return {
    totalRows: activities.length,
    validRows: activities.filter(a => a.status === 'valid').length,
    warningRows: activities.filter(a => a.status === 'warning').length,
    errorRows: activities.filter(a => a.status === 'error').length,
    activities,
    fileType: 'Primavera P6 (.xer)'
  };
}

async function parseProjectXML(file: File): Promise<ParseResult> {
  const text = await file.text();
  const activities: ParsedActivity[] = [];
  
  // Parse XML using regex (simplified approach)
  const taskRegex = /<Task>(.*?)<\/Task>/gs;
  const matches = text.matchAll(taskRegex);
  
  for (const match of matches) {
    const taskXml = match[1];
    
    // Extract fields using regex
    const uid = extractXMLValue(taskXml, 'UID');
    const name = extractXMLValue(taskXml, 'Name');
    const duration = extractXMLValue(taskXml, 'Duration');
    const work = extractXMLValue(taskXml, 'Work');
    
    if (uid && name) {
      const activity: ParsedActivity = {
        project_code: 'MSP_IMPORT',
        area_name: 'Area Principal',
        system_name: 'Sistema General',
        activity_code: `MSP-${uid}`,
        activity_name: name,
        unit: 'h',
        boq_qty: parseFloat(duration || '0') || 1,
        weight: parseFloat(work || '0') / 100 || 0.1,
        status: 'valid'
      };
      
      activities.push(activity);
    }
  }
  
  return {
    totalRows: activities.length,
    validRows: activities.filter(a => a.status === 'valid').length,
    warningRows: activities.filter(a => a.status === 'warning').length,
    errorRows: activities.filter(a => a.status === 'error').length,
    activities,
    fileType: 'Microsoft Project (.xml)'
  };
}

async function parseMSProject(file: File): Promise<ParseResult> {
  // .mpp files are binary and require specialized libraries
  // For now, return a placeholder response
  return {
    totalRows: 0,
    validRows: 0,
    warningRows: 0,
    errorRows: 1,
    activities: [{
      project_code: '',
      area_name: '',
      system_name: '',
      activity_code: '',
      activity_name: '',
      unit: '',
      boq_qty: 0,
      weight: 0,
      status: 'error',
      error_message: 'Los archivos .mpp requieren conversión a .xml primero'
    }],
    fileType: 'Microsoft Project (.mpp)'
  };
}

async function isProjectXML(file: File): Promise<boolean> {
  const text = await file.text();
  return text.includes('<Project>') || text.includes('<project>');
}

function findIndex(headers: string[], field: string): number {
  return headers.findIndex(h => h.toLowerCase().includes(field.toLowerCase()));
}

function extractXMLValue(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}