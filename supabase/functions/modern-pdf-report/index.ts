import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting PDF report generation...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { projectId, reportType = 'progress', startDate, endDate } = await req.json();
    console.log('📊 Report parameters:', { projectId, reportType, startDate, endDate });

    // Get project information
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (!project) {
      throw new Error('Proyecto no encontrado');
    }

    // Get activities data
    const { data: activities } = await supabase
      .from('activities')
      .select(`
        *,
        work_packages(name, contractor),
        activity_progress_agg(qty_accum, pct)
      `);

    // Get daily reports data
    const { data: dailyReports } = await supabase
      .from('daily_reports')
      .select(`
        *,
        progress_entries(
          qty_today,
          activities(name, code, unit, boq_qty)
        ),
        users:reporter_id(full_name, email)
      `)
      .eq('status', 'approved')
      .gte('report_date', startDate || '2024-01-01')
      .lte('report_date', endDate || new Date().toISOString().split('T')[0]);

    // Calculate summary metrics
    const totalActivities = activities?.length || 0;
    const completedActivities = activities?.filter(a => 
      a.activity_progress_agg?.some((agg: any) => agg.pct >= 1)
    ).length || 0;
    
    const totalProgress = activities?.reduce((sum, a) => {
      const progress = a.activity_progress_agg?.[0]?.qty_accum || 0;
      return sum + progress;
    }, 0) || 0;

    const totalBOQ = activities?.reduce((sum, a) => sum + a.boq_qty, 0) || 1;
    const overallProgress = (totalProgress / totalBOQ) * 100;

    // Generate HTML content
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Reporte de Progreso - ${project.name}</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                line-height: 1.6;
                color: #333;
            }
            .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 3px solid #2563eb;
                padding-bottom: 20px;
            }
            .header h1 { 
                color: #2563eb; 
                margin: 0;
                font-size: 28px;
                font-weight: bold;
            }
            .header p { 
                color: #666; 
                margin: 5px 0;
                font-size: 14px;
            }
            .summary-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
                margin: 30px 0;
            }
            .summary-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
            }
            .summary-card h3 {
                margin: 0 0 10px 0;
                color: #2563eb;
                font-size: 24px;
                font-weight: bold;
            }
            .summary-card p {
                margin: 0;
                color: #64748b;
                font-size: 14px;
            }
            .progress-bar {
                width: 100%;
                height: 20px;
                background-color: #e2e8f0;
                border-radius: 10px;
                overflow: hidden;
                margin: 20px 0;
            }
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #10b981, #059669);
                width: ${Math.min(overallProgress, 100)}%;
                transition: width 0.3s ease;
            }
            .activities-table {
                width: 100%;
                border-collapse: collapse;
                margin: 30px 0;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .activities-table th,
            .activities-table td {
                border: 1px solid #e2e8f0;
                padding: 12px 8px;
                text-align: left;
                font-size: 12px;
            }
            .activities-table th {
                background-color: #2563eb;
                color: white;
                font-weight: bold;
            }
            .activities-table tr:nth-child(even) {
                background-color: #f8fafc;
            }
            .reports-section {
                margin: 30px 0;
                page-break-before: always;
            }
            .section-title {
                color: #2563eb;
                font-size: 20px;
                font-weight: bold;
                margin: 30px 0 15px 0;
                padding-bottom: 10px;
                border-bottom: 2px solid #e2e8f0;
            }
            .report-item {
                background: #f8fafc;
                border-left: 4px solid #2563eb;
                margin: 15px 0;
                padding: 15px;
                border-radius: 0 8px 8px 0;
            }
            .report-header {
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 8px;
            }
            .report-details {
                color: #64748b;
                font-size: 13px;
                line-height: 1.4;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                color: #64748b;
                font-size: 12px;
                border-top: 1px solid #e2e8f0;
                padding-top: 20px;
            }
            @media print {
                body { padding: 10px; }
                .page-break { page-break-before: always; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Reporte de Progreso de Proyecto</h1>
            <p><strong>Proyecto:</strong> ${project.name} (${project.code})</p>
            <p><strong>Periodo:</strong> ${startDate || 'Inicio'} - ${endDate || 'Actual'}</p>
            <p><strong>Generado:</strong> ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
        </div>

        <h2 class="section-title">📊 Resumen Ejecutivo</h2>
        
        <div class="summary-grid">
            <div class="summary-card">
                <h3>${totalActivities}</h3>
                <p>Actividades Totales</p>
            </div>
            <div class="summary-card">
                <h3>${completedActivities}</h3>
                <p>Actividades Completadas</p>
            </div>
            <div class="summary-card">
                <h3>${overallProgress.toFixed(1)}%</h3>
                <p>Progreso General</p>
            </div>
            <div class="summary-card">
                <h3>${dailyReports?.length || 0}</h3>
                <p>Reportes Aprobados</p>
            </div>
        </div>

        <div>
            <h3>Progreso General del Proyecto</h3>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <p style="text-align: center; color: #64748b; margin-top: 10px;">
                ${overallProgress.toFixed(1)}% completado
            </p>
        </div>

        <h2 class="section-title">📋 Detalle de Actividades</h2>
        
        <table class="activities-table">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Actividad</th>
                    <th>Unidad</th>
                    <th>Cantidad BOQ</th>
                    <th>Ejecutado</th>
                    <th>% Avance</th>
                    <th>Paquete</th>
                </tr>
            </thead>
            <tbody>
                ${activities?.map(activity => {
                  const progress = activity.activity_progress_agg?.[0] || { qty_accum: 0, pct: 0 };
                  return `
                    <tr>
                        <td>${activity.code}</td>
                        <td>${activity.name}</td>
                        <td>${activity.unit}</td>
                        <td>${activity.boq_qty.toFixed(2)}</td>
                        <td>${progress.qty_accum.toFixed(2)}</td>
                        <td>${(progress.pct * 100).toFixed(1)}%</td>
                        <td>${activity.work_packages?.name || 'N/A'}</td>
                    </tr>
                  `;
                }).join('') || '<tr><td colspan="7" style="text-align: center;">No hay actividades disponibles</td></tr>'}
            </tbody>
        </table>

        <div class="page-break"></div>
        <div class="reports-section">
            <h2 class="section-title">📝 Reportes Diarios Aprobados</h2>
            
            ${dailyReports?.slice(0, 10).map(report => `
                <div class="report-item">
                    <div class="report-header">
                        Reporte del ${new Date(report.report_date).toLocaleDateString('es-ES')} - 
                        Turno: ${report.shift}
                    </div>
                    <div class="report-details">
                        <strong>Reportado por:</strong> ${report.users?.full_name || report.users?.email || 'N/A'}<br>
                        <strong>Actividades reportadas:</strong> ${report.progress_entries?.length || 0}<br>
                        <strong>Cantidad total:</strong> ${report.progress_entries?.reduce((sum: number, pe: any) => sum + pe.qty_today, 0)?.toFixed(2) || '0.00'}<br>
                        ${report.notes ? `<strong>Observaciones:</strong> ${report.notes}` : ''}
                    </div>
                </div>
            `).join('') || '<p>No hay reportes aprobados en el periodo seleccionado.</p>'}
            
            ${(dailyReports?.length || 0) > 10 ? `<p style="color: #64748b; font-style: italic; margin-top: 20px;">Se muestran los primeros 10 reportes de ${dailyReports?.length} totales.</p>` : ''}
        </div>

        <div class="footer">
            <p>© ${new Date().getFullYear()} FieldProgress - Sistema de Gestión de Proyectos de Construcción</p>
            <p>Reporte generado automáticamente el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
        </div>
    </body>
    </html>
    `;

    console.log('✅ PDF HTML generated successfully');

    return new Response(JSON.stringify({ 
      success: true,
      html: htmlContent,
      summary: {
        projectName: project.name,
        totalActivities,
        completedActivities,
        overallProgress: overallProgress.toFixed(1),
        reportsCount: dailyReports?.length || 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error generating PDF report:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error generating PDF report',
        details: (error as Error).message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});