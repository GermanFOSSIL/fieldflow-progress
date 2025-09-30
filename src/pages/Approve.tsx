import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Clock, Calendar, User, MapPin, MessageSquare, Phone, Image, Loader2, Eye, AlertTriangle } from "lucide-react";
import { useApprove } from "@/hooks/useApprove";
import { useProject } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Approve() {
  const { selectedProject } = useProject();
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);

  const {
    pendingReports,
    allReports,
    reportsLoading,
    allReportsLoading,
    approveReport,
    rejectReport,
    getApprovalStats,
    isApproving,
    isRejecting
  } = useApprove(selectedProject?.id);

  const stats = getApprovalStats();

  const handleApprove = async () => {
    if (!selectedReport) return;
    
    try {
      await approveReport(selectedReport.id, approvalNotes);
      setIsApprovalDialogOpen(false);
      setApprovalNotes("");
      setSelectedReport(null);
    } catch (error) {
      console.error("Error approving report:", error);
    }
  };

  const handleReject = async () => {
    if (!selectedReport || !rejectionReason.trim()) {
      toast.error("Debes proporcionar una razón para el rechazo");
      return;
    }
    
    try {
      await rejectReport(selectedReport.id, rejectionReason);
      setIsRejectionDialogOpen(false);
      setRejectionReason("");
      setSelectedReport(null);
    } catch (error) {
      console.error("Error rejecting report:", error);
    }
  };

  const openApprovalDialog = (report: any) => {
    setSelectedReport(report);
    setIsApprovalDialogOpen(true);
  };

  const openRejectionDialog = (report: any) => {
    setSelectedReport(report);
    setIsRejectionDialogOpen(true);
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Selecciona un proyecto
          </h3>
          <p className="text-sm text-muted-foreground">
            Necesitas seleccionar un proyecto para aprobar reportes
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
          <h1 className="text-3xl font-bold">Aprobar Reportes</h1>
          <p className="text-muted-foreground">
            Revisa y aprueba los reportes de avance del proyecto
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {user?.email || 'Supervisor'}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {selectedProject.name}
          </Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
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
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.approvalRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Tasa Aprobación</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Pendientes ({pendingReports?.length || 0})</TabsTrigger>
            <TabsTrigger value="history">Historial ({allReports?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="space-y-4">
              {reportsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Cargando reportes...</span>
                </div>
              ) : pendingReports?.length > 0 ? (
                <div className="space-y-4">
                  {pendingReports.map((report) => (
                    <Card key={report.id} className="border-l-4 border-l-yellow-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              Reporte del {new Date(report.report_date).toLocaleDateString()}
                            </CardTitle>
                            <CardDescription>
                              Turno: {report.shift} | Reportero: {report.reporter?.full_name || 'Usuario'}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {report.entries?.length || 0} actividades
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {report.notes && (
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm">
                                <strong>Notas:</strong> {report.notes}
                              </p>
                            </div>
                          )}

                          {/* Activities Summary */}
                          {report.entries && report.entries.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Actividades Reportadas:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {report.entries.slice(0, 4).map((entry) => (
                                  <div key={entry.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                    <span className="text-sm font-medium">{entry.activity?.code}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {entry.qty_today} {entry.activity?.unit}
                                    </span>
                                  </div>
                                ))}
                                {report.entries.length > 4 && (
                                  <div className="text-sm text-muted-foreground">
                                    +{report.entries.length - 4} más...
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-4 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedReport(report)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalles
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openApprovalDialog(report)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Aprobar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openRejectionDialog(report)}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Rechazar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No hay reportes pendientes
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Todos los reportes han sido procesados
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="space-y-4">
              {allReportsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Cargando historial...</span>
                </div>
              ) : allReports?.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Turno</TableHead>
                        <TableHead>Reportero</TableHead>
                        <TableHead>Actividades</TableHead>
                        <TableHead>Progreso</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>{new Date(report.report_date).toLocaleDateString()}</TableCell>
                          <TableCell className="capitalize">{report.shift}</TableCell>
                          <TableCell>{report.reporter?.full_name || 'Usuario'}</TableCell>
                          <TableCell>{report.entries?.length || 0}</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                report.status === 'approved' ? 'default' :
                                report.status === 'rejected' ? 'destructive' : 'secondary'
                              }
                            >
                              {report.status === 'approved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {report.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                              {report.status === 'submitted' && <Clock className="w-3 h-3 mr-1" />}
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedReport(report)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No hay reportes en el historial
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Los reportes aprobados aparecerán aquí
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar Reporte</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres aprobar este reporte?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedReport && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p><strong>Fecha:</strong> {new Date(selectedReport.date).toLocaleDateString()}</p>
                <p><strong>Turno:</strong> {selectedReport.shift}</p>
                <p><strong>Reportero:</strong> {selectedReport.reporter?.full_name || selectedReport.reporter?.email}</p>
                <p><strong>Actividades:</strong> {selectedReport.total_activities}</p>
                <p><strong>Progreso:</strong> {selectedReport.total_progress}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Notas de aprobación (opcional)</label>
              <Textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Agrega comentarios sobre la aprobación..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleApprove} 
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isApproving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Aprobando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Aprobar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Reporte</DialogTitle>
            <DialogDescription>
              Proporciona una razón para el rechazo del reporte
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedReport && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p><strong>Fecha:</strong> {new Date(selectedReport.date).toLocaleDateString()}</p>
                <p><strong>Turno:</strong> {selectedReport.shift}</p>
                <p><strong>Reportero:</strong> {selectedReport.reporter?.full_name || selectedReport.reporter?.email}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Razón del rechazo *</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explica por qué se rechaza este reporte..."
                className="mt-1"
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject} 
              disabled={isRejecting || !rejectionReason.trim()}
            >
              {isRejecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rechazando...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Rechazar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}