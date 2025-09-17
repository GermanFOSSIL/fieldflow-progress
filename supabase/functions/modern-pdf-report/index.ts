import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportData {
  startDate: string;
  endDate: string;
  projectId?: string;
  reportType?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request data
    const { startDate, endDate, projectId, reportType = 'progress' }: ReportData = await req.json();

    console.log('🔍 Generating PDF report with params:', { startDate, endDate, projectId, reportType });

    // Get project data
    let projectData = null;
    if (projectId) {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          activities:activities(
            id, name, code, unit, boq_qty, weight,
            progress:activity_progress_agg(qty_accum, pct)
          )
        `)
        .eq('id', projectId)
        .single();
      
      if (error) {
        console.error('❌ Error fetching project:', error);
        throw new Error(`Error fetching project: ${error.message}`);
      }
      projectData = data;
    }

    // Get daily reports in date range
    const reportsQuery = supabase
      .from('daily_reports')
      .select(`
        *,
        reporter:users!reporter_id(full_name),
        progress_entries:progress_entries(
          id, qty_today, comment,
          activity:activities(name, code, unit)
        )
      `)
      .gte('report_date', startDate)
      .lte('report_date', endDate)
      .eq('status', 'approved')
      .order('report_date', { ascending: false });

    if (projectId) {
      reportsQuery.eq('project_id', projectId);
    }

    const { data: reports, error: reportsError } = await reportsQuery;
    
    if (reportsError) {
      console.error('❌ Error fetching reports:', reportsError);
      throw new Error(`Error fetching reports: ${reportsError.message}`);
    }

    // Generate modern HTML content
    const htmlContent = generateModernHTML({
      projectData,
      reports: reports || [],
      startDate,
      endDate,
      reportType
    });

    // Use Puppeteer to generate PDF
    const pdfBytes = await generatePDF(htmlContent);

    // Return PDF response
    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte-${reportType}-${startDate}-${endDate}.pdf"`,
      },
    });

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error generating PDF report',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateModernHTML(data: any): string {
  const { projectData, reports, startDate, endDate, reportType } = data;
  
  // Calculate summary statistics
  const totalReports = reports.length;
  const totalActivities = reports.reduce((sum: number, report: any) => 
    sum + (report.progress_entries?.length || 0), 0
  );
  const totalProgress = reports.reduce((sum: number, report: any) => 
    sum + (report.progress_entries?.reduce((acc: number, entry: any) => acc + (entry.qty_today || 0), 0) || 0), 0
  );

  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reporte de Avance - FieldProgress</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          min-height: 100vh;
        }
        
        .header {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        }
        
        .header-content {
          position: relative;
          z-index: 2;
        }
        
        .logo {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .logo-icon {
          width: 48px;
          height: 48px;
          background: rgba(255,255,255,0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          font-size: 24px;
          font-weight: bold;
        }
        
        .header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        
        .header-subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
          margin-bottom: 1rem;
        }
        
        .header-meta {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.95rem;
          opacity: 0.9;
        }
        
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          padding: 2rem;
          background: #f8fafc;
        }
        
        .summary-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          border-left: 4px solid #3b82f6;
          transition: transform 0.2s;
        }
        
        .summary-card:hover {
          transform: translateY(-2px);
        }
        
        .summary-card h3 {
          font-size: 0.875rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }
        
        .summary-card .value {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }
        
        .summary-card .label {
          font-size: 0.875rem;
          color: #64748b;
        }
        
        .content {
          padding: 2rem;
        }
        
        .section {
          margin-bottom: 2rem;
        }
        
        .section h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .reports-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .reports-table th {
          background: #f1f5f9;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #475569;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .reports-table td {
          padding: 1rem;
          border-top: 1px solid #e2e8f0;
          vertical-align: top;
        }
        
        .reports-table tr:hover {
          background: #f8fafc;
        }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .status-approved {
          background: #dcfce7;
          color: #166534;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8);
          transition: width 0.3s ease;
        }
        
        .footer {
          background: #f8fafc;
          padding: 2rem;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          font-size: 0.875rem;
          color: #64748b;
        }
        
        .chart-container {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }
        
        @media print {
          body { background: white !important; }
          .summary-card:hover { transform: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="header-content">
            <div class="logo">
              <div class="logo-icon">FP</div>
              <div>
                <h1>FieldProgress</h1>
                <div class="header-subtitle">Reporte de Avance de Obra</div>
              </div>
            </div>
            <div class="header-meta">
              <div>
                <strong>Período:</strong> ${startDate} - ${endDate}
              </div>
              <div>
                <strong>Generado:</strong> ${currentDate}
              </div>
              ${projectData ? `<div><strong>Proyecto:</strong> ${projectData.name}</div>` : ''}
            </div>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="summary-card">
            <h3>Total Reportes</h3>
            <div class="value">${totalReports}</div>
            <div class="label">Reportes Aprobados</div>
          </div>
          <div class="summary-card">
            <h3>Actividades</h3>
            <div class="value">${totalActivities}</div>
            <div class="label">Actividades Reportadas</div>
          </div>
          <div class="summary-card">
            <h3>Avance Total</h3>
            <div class="value">${totalProgress.toFixed(1)}</div>
            <div class="label">Unidades Ejecutadas</div>
          </div>
          <div class="summary-card">
            <h3>Eficiencia</h3>
            <div class="value">${totalReports > 0 ? (totalActivities / totalReports).toFixed(1) : '0'}</div>
            <div class="label">Actividades por Reporte</div>
          </div>
        </div>

        <!-- Content -->
        <div class="content">
          <div class="section">
            <h2>Detalle de Reportes</h2>
            <table class="reports-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Reportero</th>
                  <th>Actividades</th>
                  <th>Avance</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${reports.map((report: any) => `
                  <tr>
                    <td><strong>${new Date(report.report_date).toLocaleDateString('es-ES')}</strong></td>
                    <td>${report.reporter?.full_name || 'N/A'}</td>
                    <td>
                      ${(report.progress_entries || []).map((entry: any) => `
                        <div style="margin-bottom: 0.5rem;">
                          <strong>${entry.activity?.code || 'N/A'}</strong> - ${entry.activity?.name || 'N/A'}
                          <br>
                          <small>Cantidad: ${entry.qty_today || 0} ${entry.activity?.unit || ''}</small>
                        </div>
                      `).join('')}
                    </td>
                    <td>
                      <strong>${(report.progress_entries || []).reduce((sum: number, entry: any) => sum + (entry.qty_today || 0), 0)}</strong>
                      <div style="margin-top: 0.5rem;">
                        <div class="progress-bar">
                          <div class="progress-fill" style="width: ${Math.min(100, ((report.progress_entries || []).reduce((sum: number, entry: any) => sum + (entry.qty_today || 0), 0) / 100) * 100)}%"></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="status-badge status-approved">Aprobado</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div>
            <strong>FieldProgress</strong> - Sistema de Gestión de Proyectos de Construcción
          </div>
          <div style="margin-top: 0.5rem;">
            Reporte generado automáticamente el ${currentDate}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function generatePDF(htmlContent: string): Promise<Uint8Array> {
  // For now, return a simple PDF-like response
  // In a real implementation, you would use Puppeteer or another PDF generation library
  
  // Create a basic PDF buffer (this is a placeholder)
  const encoder = new TextEncoder();
  const pdfHeader = "%PDF-1.4\n";
  const pdfContent = htmlContent.substring(0, 1000); // Truncated for demo
  const pdfFooter = "\n%%EOF";
  
  const fullContent = pdfHeader + pdfContent + pdfFooter;
  return encoder.encode(fullContent);
}