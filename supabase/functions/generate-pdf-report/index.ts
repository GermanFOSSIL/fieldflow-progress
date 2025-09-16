import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportData, reportType } = await req.json();
    
    console.log('Generating PDF report:', { reportType, reportId: reportData?.id });

    // Generar contenido HTML para el PDF
    const htmlContent = generateReportHTML(reportData, reportType);
    
    // En un entorno real, aquí usarías una librería como Puppeteer o similar
    // Por ahora, retornamos un PDF simulado
    const pdfBuffer = generateMockPDF(reportData, reportType);

    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="diario_obra_${reportData.date || 'demo'}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate PDF' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateReportHTML(reportData: any, reportType: string): string {
  const currentDate = new Date().toLocaleDateString('es-ES');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Diario de Obra - FieldProgress</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .project-info { margin: 20px 0; }
        .activities-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .activities-table th, .activities-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .activities-table th { background-color: #f2f2f2; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>DIARIO DE OBRA</h1>
        <h2>FieldProgress - Control de Avance</h2>
      </div>
      
      <div class="project-info">
        <h3>Información del Proyecto</h3>
        <p><strong>Proyecto:</strong> ${reportData?.project || 'Planta de Procesamiento de Gas San Martín'}</p>
        <p><strong>Fecha:</strong> ${reportData?.date || currentDate}</p>
        <p><strong>Turno:</strong> ${reportData?.shift || 'Día'}</p>
        <p><strong>Supervisor:</strong> ${reportData?.supervisor || 'Ing. Carlos Mendez'}</p>
        <p><strong>Progreso Acumulado:</strong> ${reportData?.totalProgress || '67'}%</p>
      </div>

      <h3>Avances del Día</h3>
      <table class="activities-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Actividad</th>
            <th>Unidad</th>
            <th>Cant. Hoy</th>
            <th>Progreso %</th>
            <th>Comentarios</th>
          </tr>
        </thead>
        <tbody>
          ${generateActivitiesRows(reportData?.activities)}
        </tbody>
      </table>

      <div class="footer">
        <p>Generado por FieldProgress el ${currentDate}</p>
        <p>Firma Digital: ${reportData?.supervisor || 'Ing. Carlos Mendez'} - Supervisor de Obra</p>
      </div>
    </body>
    </html>
  `;
}

function generateActivitiesRows(activities: any[]): string {
  const defaultActivities = [
    { code: 'P-001', name: 'Soldadura líneas de 6" Schedule 40', unit: 'jnt', todayQty: 12, progress: 67, comment: 'Soldaduras según WPS-001' },
    { code: 'I-001', name: 'Instalación transmisores de presión', unit: 'u', todayQty: 3, progress: 64, comment: 'Transmisores calibrados' },
    { code: 'M-001', name: 'Instalación separador trifásico', unit: 'u', todayQty: 1, progress: 50, comment: 'Separador posicionado' }
  ];

  const activitiesToRender = activities || defaultActivities;
  
  return activitiesToRender.map(activity => `
    <tr>
      <td>${activity.code}</td>
      <td>${activity.name}</td>
      <td>${activity.unit}</td>
      <td>${activity.todayQty}</td>
      <td>${activity.progress}%</td>
      <td>${activity.comment}</td>
    </tr>
  `).join('');
}

function generateMockPDF(reportData: any, reportType: string): Uint8Array {
  // En un entorno real, aquí convertiríamos el HTML a PDF
  // Por ahora, generamos un PDF simple con datos básicos
  
  const pdfHeader = "%PDF-1.4\n";
  const pdfContent = `
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
50 750 Td
(DIARIO DE OBRA - FieldProgress) Tj
0 -20 Td
(Proyecto: Planta de Procesamiento de Gas) Tj
0 -20 Td
(Fecha: ${reportData?.date || new Date().toLocaleDateString('es-ES')}) Tj
0 -20 Td
(Progreso: ${reportData?.totalProgress || '67'}%) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000136 00000 n 
0000000271 00000 n 
0000000521 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
608
%%EOF
`;

  return new TextEncoder().encode(pdfHeader + pdfContent);
}