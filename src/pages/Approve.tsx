import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Clock, Calendar, User, MapPin, MessageSquare, Phone, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProject } from "@/contexts/ProjectContext";

interface MockEntry {
  id: string;
  code: string;
  activity: string;
  unit: string;
  boqQty: number;
  executedQty: number;
  todayQty: number;
  comment?: string;
}

interface MockReport {
  id: string;
  reportDate: string;
  shift: string;
  reporter: string;
  supervisorId?: string;
  notes?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'whatsapp';
  source: 'app' | 'whatsapp';
  entries: MockEntry[];
  whatsappData?: {
    phone: string;
    timestamp: string;
    attachments?: string[];
    location?: string;
  };
}

export default function Approve() {
  const { toast } = useToast();
  const { selectedProject } = useProject();
  const [reports, setReports] = useState<MockReport[]>([
    {
      id: "REP001",
      reportDate: "2024-01-15",
      shift: "Mañana", 
      reporter: "Carlos Mendez",
      notes: "Avance normal, sin contratiempos",
      status: "sent",
      source: "app",
      entries: [
        {
          id: "E001",
          code: "EST.001", 
          activity: "Estructura Torre A - Piso 5",
          unit: "m³",
          boqQty: 150,
          executedQty: 128,
          todayQty: 15,
          comment: "Completado según cronograma"
        }
      ]
    },
    {
      id: "REP002",
      reportDate: "2024-01-15",
      shift: "Tarde",
      reporter: "Ana López",
      notes: "Reporte enviado desde campo vía WhatsApp",
      status: "whatsapp",
      source: "whatsapp",
      whatsappData: {
        phone: "+52 555 987 6543",
        timestamp: "2024-01-15T14:30:00Z",
        attachments: ["excavacion-sector-b.jpg", "mediciones.jpg"],
        location: "Sector B - Zona de excavación"
      },
      entries: [
        {
          id: "E003",
          code: "EXC.001",
          activity: "Excavación Sector B",
          unit: "m³",
          boqQty: 200,
          executedQty: 165,
          todayQty: 25,
          comment: "Enviado desde WhatsApp - necesita validación"
        }
      ]
    }
  ]);

  const handleApprove = (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { ...report, status: "approved" } : report
    ));
    
    toast({
      title: "Reporte Aprobado",
      description: `Reporte ${reportId} aprobado e integrado al sistema.`,
    });
  };

  const handleReject = (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { ...report, status: "rejected" } : report
    ));
    
    toast({
      title: "Reporte Rechazado",
      description: `Reporte ${reportId} rechazado.`,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aprobaciones</h1>
          <p className="text-muted-foreground">
            Revisar y aprobar reportes de avance - Proyecto: {selectedProject?.name || 'Ninguno'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {reports.filter(r => r.status === 'sent').length} App
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            {reports.filter(r => r.status === 'whatsapp').length} WhatsApp
          </Badge>
          <Badge variant="outline">
            {reports.filter(r => ['sent', 'whatsapp'].includes(r.status)).length} Total Pendientes
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos ({reports.length})</TabsTrigger>
          <TabsTrigger value="app">App ({reports.filter(r => r.source === 'app').length})</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp ({reports.filter(r => r.source === 'whatsapp').length})</TabsTrigger>
          <TabsTrigger value="pending">Pendientes ({reports.filter(r => ['sent', 'whatsapp'].includes(r.status)).length})</TabsTrigger>
        </TabsList>

        {['all', 'app', 'whatsapp', 'pending'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {reports
              .filter(r => {
                if (tab === 'app') return r.source === 'app';
                if (tab === 'whatsapp') return r.source === 'whatsapp';
                if (tab === 'pending') return ['sent', 'whatsapp'].includes(r.status);
                return true;
              })
              .map((report) => (
                <Card key={report.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            Reporte #{report.id}
                            {report.source === 'whatsapp' && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                WhatsApp
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {report.reportDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {report.shift}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {report.reporter}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={
                          report.status === 'approved' 
                            ? 'default' 
                            : report.status === 'rejected' 
                            ? 'destructive' 
                            : 'secondary'
                        }
                      >
                        {report.status === 'approved' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {report.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                        {report.status === 'sent' && <Clock className="h-3 w-3 mr-1" />}
                        {report.status === 'whatsapp' && <MessageSquare className="h-3 w-3 mr-1" />}
                        {report.status === 'approved' && 'Aprobado'}
                        {report.status === 'rejected' && 'Rechazado'}  
                        {report.status === 'sent' && 'Pendiente'}
                        {report.status === 'whatsapp' && 'WhatsApp - Pendiente'}
                      </Badge>
                    </div>
                    
                    {report.whatsappData && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MessageSquare className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Recibido vía WhatsApp</span>
                            <span className="text-muted-foreground">
                              {new Date(report.whatsappData.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {report.whatsappData.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {report.whatsappData.location}
                            </div>
                          )}
                          {report.whatsappData.attachments && report.whatsappData.attachments.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Image className="h-4 w-4" />
                              {report.whatsappData.attachments.length} imagen(es)
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent>
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
                            <TableCell className="font-mono">{entry.code}</TableCell>
                            <TableCell>{entry.activity}</TableCell>
                            <TableCell>{entry.unit}</TableCell>
                            <TableCell>{entry.boqQty}</TableCell>
                            <TableCell>{entry.executedQty}</TableCell>
                            <TableCell>
                              {['sent', 'whatsapp'].includes(report.status) ? (
                                <Input
                                  type="number"
                                  value={entry.todayQty}
                                  onChange={(e) => updateQuantity(report.id, entry.id, parseFloat(e.target.value) || 0)}
                                  className="w-20"
                                />
                              ) : (
                                entry.todayQty
                              )}
                            </TableCell>
                            <TableCell className="max-w-[200px]">
                              <p className="text-sm truncate">{entry.comment}</p>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {['sent', 'whatsapp'].includes(report.status) && (
                      <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                        <Button variant="outline" onClick={() => handleReject(report.id)}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Rechazar
                        </Button>
                        <Button onClick={() => handleApprove(report.id)}>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Aprobar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}