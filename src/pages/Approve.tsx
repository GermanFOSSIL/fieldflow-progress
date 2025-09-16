import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Clock, AlertTriangle, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Approve() {
  const { toast } = useToast();
  
  // Mock data para reportes pendientes
  const [reports, setReports] = useState([
    {
      id: "RPT-001",
      date: "2024-01-15",
      shift: "Día",
      reporter: "Juan Pérez",
      status: "sent",
      entries: [
        {
          id: "P-001",
          name: "Soldadura líneas de 6\" Schedule 40",
          unit: "jnt",
          boqQty: 120,
          executed: 78,
          todayQty: 12,
          comment: "Soldaduras completadas según WPS-001"
        },
        {
          id: "I-001", 
          name: "Instalación transmisores de presión",
          unit: "u",
          boqQty: 45,
          executed: 28,
          todayQty: 3,
          comment: "Transmisores calibrados y probados"
        }
      ]
    },
    {
      id: "RPT-002",
      date: "2024-01-15",
      shift: "Noche",
      reporter: "María González",
      status: "sent",
      entries: [
        {
          id: "M-001",
          name: "Instalación separador trifásico",
          unit: "u",
          boqQty: 2,
          executed: 1,
          todayQty: 1,
          comment: "Separador posicionado y nivelado"
        }
      ]
    }
  ]);

  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const handleApprove = (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { ...report, status: "approved" } : report
    ));
    
    toast({
      title: "Reporte Aprobado",
      description: `El reporte ${reportId} ha sido aprobado exitosamente.`,
    });
  };

  const handleReject = (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { ...report, status: "rejected" } : report
    ));
    
    toast({
      title: "Reporte Rechazado",
      description: `El reporte ${reportId} ha sido rechazado.`,
      variant: "destructive",
    });
  };

  const updateQuantity = (reportId: string, entryId: string, newQty: number) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? {
            ...report,
            entries: report.entries.map(entry =>
              entry.id === entryId ? { ...entry, todayQty: newQty } : entry
            )
          }
        : report
    ));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Aprobaciones</h1>
          <p className="text-muted-foreground">Revisar y aprobar reportes de avance diario</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {reports.filter(r => r.status === 'sent').length} pendientes
        </Badge>
      </div>

      {/* Reports List */}
      <div className="grid gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="construction-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Reporte {report.id}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {report.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Turno {report.shift}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {report.reporter}
                    </span>
                  </CardDescription>
                </div>
                <Badge 
                  variant={
                    report.status === "approved" ? "default" :
                    report.status === "rejected" ? "destructive" : "secondary"
                  }
                >
                  {report.status === "approved" ? "Aprobado" :
                   report.status === "rejected" ? "Rechazado" : "Pendiente"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Actividad</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead>BOQ</TableHead>
                      <TableHead>Ejecutado</TableHead>
                      <TableHead>Hoy</TableHead>
                      <TableHead>Comentario</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-mono font-medium">{entry.id}</TableCell>
                        <TableCell>{entry.name}</TableCell>
                        <TableCell className="font-mono">{entry.unit}</TableCell>
                        <TableCell className="font-mono">{entry.boqQty}</TableCell>
                        <TableCell className="font-mono">{entry.executed}</TableCell>
                        <TableCell>
                          {report.status === "sent" ? (
                            <Input
                              type="number"
                              value={entry.todayQty}
                              onChange={(e) => updateQuantity(report.id, entry.id, parseFloat(e.target.value) || 0)}
                              className="w-20 font-mono"
                              min="0"
                            />
                          ) : (
                            <span className="font-mono">{entry.todayQty}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            {report.status === "sent" ? (
                              <Textarea
                                value={entry.comment}
                                disabled
                                className="min-h-[60px] text-sm"
                              />
                            ) : (
                              <p className="text-sm">{entry.comment}</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {report.status === "sent" && (
                <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => handleReject(report.id)}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Rechazar
                  </Button>
                  <Button 
                    variant="default"
                    onClick={() => handleApprove(report.id)}
                    className="bg-primary text-white"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Aprobar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}