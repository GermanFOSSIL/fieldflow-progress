import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Reports() {
  const { toast } = useToast();
  
  const [selectedProject, setSelectedProject] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("");

  // Mock data para reportes históricos
  const historicalReports = [
    {
      id: "RPT-001",
      date: "2024-01-15",
      shift: "Día",
      reporter: "Juan Pérez",
      status: "approved",
      totalActivities: 3,
      progress: 12.5
    },
    {
      id: "RPT-002", 
      date: "2024-01-15",
      shift: "Noche",
      reporter: "María González",
      status: "approved",
      totalActivities: 1,
      progress: 8.2
    },
    {
      id: "RPT-003",
      date: "2024-01-14",
      shift: "Día", 
      reporter: "Carlos Silva",
      status: "approved",
      totalActivities: 5,
      progress: 15.7
    }
  ];

  const handleGeneratePDF = async () => {
    toast({
      title: "Generando Reporte PDF",
      description: "El Diario de Obra se está generando. Se descargará automáticamente.",
    });
    
    try {
      const reportData = {
        project: selectedProject || "Planta de Procesamiento de Gas San Martín",
        date: startDate || new Date().toISOString().split('T')[0],
        shift: "Día",
        supervisor: "Ing. Carlos Mendez",
        totalProgress: 67,
        activities: [
          { code: 'P-001', name: 'Soldadura líneas de 6" Schedule 40', unit: 'jnt', todayQty: 12, progress: 67, comment: 'Soldaduras según WPS-001' },
          { code: 'I-001', name: 'Instalación transmisores de presión', unit: 'u', todayQty: 3, progress: 64, comment: 'Transmisores calibrados' },
          { code: 'M-001', name: 'Instalación separador trifásico', unit: 'u', todayQty: 1, progress: 50, comment: 'Separador posicionado' }
        ]
      };

      const { data, error } = await supabase.functions.invoke('generate-pdf-report', {
        body: {
          reportData,
          reportType: reportType || 'daily'
        }
      });

      if (error) {
        throw error;
      }

      // Create blob from returned data
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diario_obra_${reportData.date}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Reporte Generado",
        description: "El Diario de Obra ha sido generado y descargado exitosamente.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el reporte PDF. Inténtalo nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    toast({
      title: "Exportando CSV",
      description: "Los datos se están exportando en formato CSV.",
    });
    
    // Aquí iría la lógica para exportar CSV
    setTimeout(() => {
      toast({
        title: "Exportación Completa",
        description: "Los datos han sido exportados exitosamente.",
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes</h1>
          <p className="text-muted-foreground">Generar y exportar reportes de progreso del proyecto</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <BarChart3 className="mr-2 h-4 w-4" />
          Analítica Avanzada
        </Badge>
      </div>

      {/* Report Generation */}
      <Card className="construction-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generar Reporte
          </CardTitle>
          <CardDescription>
            Configurar parámetros para generar Diario de Obra en PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="project">Proyecto</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FP01">FieldProgress Demo</SelectItem>
                  <SelectItem value="FP02">Proyecto Piloto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="start-date">Fecha Inicio</Label>
              <Input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="end-date">Fecha Fin</Label>
              <Input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="report-type">Tipo de Reporte</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diario de Obra</SelectItem>
                  <SelectItem value="weekly">Resumen Semanal</SelectItem>
                  <SelectItem value="monthly">Resumen Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              variant="default"
              onClick={handleGeneratePDF}
              className="bg-primary text-white"
            >
              <FileText className="mr-2 h-4 w-4" />
              Generar Reporte (PDF)
            </Button>
            <Button 
              variant="outline"
              onClick={handleExportCSV}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historical Reports */}
      <Card className="construction-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reportes Históricos
          </CardTitle>
          <CardDescription>
            Historial de reportes diarios aprobados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Reporte</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Reportero</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Actividades</TableHead>
                  <TableHead>Progreso (%)</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historicalReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-mono font-medium">{report.id}</TableCell>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>{report.shift}</TableCell>
                    <TableCell>{report.reporter}</TableCell>
                    <TableCell>
                      <Badge variant="default">
                        Aprobado
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{report.totalActivities}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-chart-success" />
                        <span className="font-mono">{report.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card className="construction-card">
        <CardHeader>
          <CardTitle>Vista Previa del Reporte</CardTitle>
          <CardDescription>
            Ejemplo de contenido que incluirá el Diario de Obra
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Portada del Reporte:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
                  <li>Nombre del Proyecto</li>
                  <li>Fecha y Turno</li>
                  <li>% de Avance Acumulado</li>
                  <li>Mini Curva S (Plan vs Real)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Contenido del Reporte:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
                  <li>Tabla de Avances del Día</li>
                  <li>Hasta 3 fotos por actividad</li>
                  <li>Comentarios del reportero</li>
                  <li>Estado de aprobación</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}