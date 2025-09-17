import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Calendar, TrendingUp, BarChart3, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useReports } from "@/hooks/useReports";
import { useProject } from "@/contexts/ProjectContext";
import { toast } from "sonner";

export default function Reports() {
  const { selectedProject } = useProject();
  const [reportType, setReportType] = useState("daily");
  const [activeTab, setActiveTab] = useState("reports");

  const {
    historicalReports,
    activityProgress,
    projectSummary,
    reportsLoading,
    progressLoading,
    summaryLoading,
    dateRange,
    setDateRange,
    generatePDFReport,
    exportToExcel,
    getReportStats
  } = useReports(selectedProject?.id);

  const stats = getReportStats();

  const handleGeneratePDF = async () => {
    await generatePDFReport(reportType as 'daily' | 'weekly' | 'monthly');
  };

  const handleExportExcel = async () => {
    await exportToExcel();
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Selecciona un proyecto
          </h3>
          <p className="text-sm text-muted-foreground">
            Necesitas seleccionar un proyecto para generar reportes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes y Análisis</h1>
          <p className="text-muted-foreground">
            Genera reportes detallados del progreso del proyecto
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {selectedProject.name}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      {projectSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{projectSummary.total_activities}</p>
                  <p className="text-xs text-muted-foreground">Total Actividades</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{projectSummary.completed_activities}</p>
                  <p className="text-xs text-muted-foreground">Completadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{projectSummary.completion_percentage.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Progreso Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{projectSummary.average_daily_progress.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Promedio Diario</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generar Reportes</CardTitle>
          <CardDescription>
            Configura y genera reportes en diferentes formatos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date-range">Rango de Fechas</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                />
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="report-type">Tipo de Reporte</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diario</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleGeneratePDF} className="flex-1">
                <FileText className="w-4 h-4 mr-2" />
                Generar PDF
              </Button>
              <Button variant="outline" onClick={handleExportExcel}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports">Reportes Históricos</TabsTrigger>
            <TabsTrigger value="activities">Progreso por Actividad</TabsTrigger>
            <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-6">
            <div className="space-y-4">
              {reportsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Cargando reportes...</span>
                </div>
              ) : historicalReports?.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Turno</TableHead>
                        <TableHead>Reportero</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Actividades</TableHead>
                        <TableHead>Progreso</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historicalReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                          <TableCell className="capitalize">{report.shift}</TableCell>
                          <TableCell>{report.reporter?.full_name || report.reporter?.email}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                report.status === 'approved' ? 'default' :
                                report.status === 'rejected' ? 'destructive' : 'secondary'
                              }
                            >
                              {report.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {report.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                              {report.status === 'submitted' && <Clock className="w-3 h-3 mr-1" />}
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{report.total_activities}</TableCell>
                          <TableCell>{report.total_progress}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={report.notes || ''}>
                              {report.notes || '-'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No hay reportes en el rango seleccionado
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ajusta el rango de fechas o espera a que se generen más reportes
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activities" className="mt-6">
            <div className="space-y-4">
              {progressLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Cargando actividades...</span>
                </div>
              ) : activityProgress?.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Actividad</TableHead>
                        <TableHead>Unidad</TableHead>
                        <TableHead>BOQ</TableHead>
                        <TableHead>Ejecutado</TableHead>
                        <TableHead>Progreso</TableHead>
                        <TableHead>Última Actualización</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityProgress.map((activity) => (
                        <TableRow key={activity.activity_id}>
                          <TableCell className="font-medium">{activity.activity_code}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={activity.activity_name}>
                              {activity.activity_name}
                            </div>
                          </TableCell>
                          <TableCell>{activity.unit}</TableCell>
                          <TableCell>{activity.boq_qty}</TableCell>
                          <TableCell>{activity.total_executed}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${activity.progress_percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {activity.progress_percentage.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(activity.last_updated).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No hay actividades disponibles
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Importa actividades o verifica la configuración del proyecto
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="mt-6">
            <div className="space-y-6">
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats.total}</p>
                          <p className="text-xs text-muted-foreground">Total Reportes</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats.approved}</p>
                          <p className="text-xs text-muted-foreground">Aprobados</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats.rejected}</p>
                          <p className="text-xs text-muted-foreground">Rechazados</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats.averageProgress.toFixed(1)}</p>
                          <p className="text-xs text-muted-foreground">Promedio Diario</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Resumen del Proyecto</CardTitle>
                </CardHeader>
                <CardContent>
                  {projectSummary ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Actividades Totales</p>
                          <p className="text-2xl font-bold">{projectSummary.total_activities}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Actividades Completadas</p>
                          <p className="text-2xl font-bold">{projectSummary.completed_activities}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Progreso Total</p>
                          <p className="text-2xl font-bold">{projectSummary.completion_percentage.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Progreso Promedio Diario</p>
                          <p className="text-2xl font-bold">{projectSummary.average_daily_progress.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Cargando resumen...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}