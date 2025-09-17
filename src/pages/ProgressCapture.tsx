import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Camera, Search, Save, Send, Plus, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useProgressCapture } from "@/hooks/useProgressCapture";
import { useProject } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function ProgressCapture() {
  const { selectedProject } = useProject();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState("morning");
  const [searchTerm, setSearchTerm] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [entryComments, setEntryComments] = useState<Record<string, string>>({});
  const [entryQuantities, setEntryQuantities] = useState<Record<string, number>>({});

  // Use real data from hooks
  const {
    activities,
    todayEntries,
    activitiesLoading,
    entriesLoading,
    saveProgressEntry,
    submitDailyReport,
    getProgressSummary,
    isSaving,
    isSubmitting
  } = useProgressCapture(selectedProject?.id);

  // Filter activities based on search
  const filteredActivities = activities?.filter(activity =>
    activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Handle quantity change
  const handleQuantityChange = (activityId: string, quantity: number) => {
    setEntryQuantities(prev => ({
      ...prev,
      [activityId]: quantity
    }));
  };

  // Handle comment change
  const handleCommentChange = (activityId: string, comment: string) => {
    setEntryComments(prev => ({
      ...prev,
      [activityId]: comment
    }));
  };

  // Save individual entry
  const handleSaveEntry = async (activityId: string) => {
    const quantity = entryQuantities[activityId] || 0;
    const comment = entryComments[activityId] || "";

    if (quantity <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    try {
      await saveProgressEntry(activityId, quantity, comment);
      // Clear the entry after saving
      setEntryQuantities(prev => {
        const newState = { ...prev };
        delete newState[activityId];
        return newState;
      });
      setEntryComments(prev => {
        const newState = { ...prev };
        delete newState[activityId];
        return newState;
      });
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };

  // Submit daily report
  const handleSubmitReport = async () => {
    try {
      await submitDailyReport(reportNotes);
      setReportNotes("");
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  // Get today's entry for an activity
  const getTodayEntry = (activityId: string) => {
    return todayEntries?.find(entry => entry.activity_id === activityId);
  };

  const summary = getProgressSummary();

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Selecciona un proyecto
          </h3>
          <p className="text-sm text-muted-foreground">
            Necesitas seleccionar un proyecto para capturar avances
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
          <h1 className="text-3xl font-bold">Carga Diaria de Avances</h1>
          <p className="text-muted-foreground">
            Proyecto: {selectedProject.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {user?.email || 'Usuario'}
          </Badge>
          <Badge variant="outline" className="text-sm">
            {selectedDate}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.totalActivities}</p>
                  <p className="text-xs text-muted-foreground">Total Actividades</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Send className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.activitiesWithProgress}</p>
                  <p className="text-xs text-muted-foreground">Con Progreso</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Camera className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.totalProgress}</p>
                  <p className="text-xs text-muted-foreground">Progreso Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(summary.completionRate || 0).toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Completado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalles del Parte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="shift">Turno</Label>
              <Select value={selectedShift} onValueChange={setSelectedShift}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Mañana (06:00 - 14:00)</SelectItem>
                  <SelectItem value="afternoon">Tarde (14:00 - 22:00)</SelectItem>
                  <SelectItem value="night">Noche (22:00 - 06:00)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reporter">Reportante</Label>
              <Input 
                value={user?.email || 'Usuario'} 
                disabled 
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar actividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Actividad
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Actividades del Proyecto</CardTitle>
          <CardDescription>
            Registra el progreso de cada actividad para el día de hoy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Cargando actividades...</span>
            </div>
          ) : (
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
                    <TableHead>Hoy</TableHead>
                    <TableHead>Comentario</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => {
                    const todayEntry = getTodayEntry(activity.id);
                    const currentQuantity = entryQuantities[activity.id] || 0;
                    const currentComment = entryComments[activity.id] || "";

                    return (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium">{activity.code}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={activity.name}>
                            {activity.name}
                          </div>
                        </TableCell>
                        <TableCell>{activity.unit}</TableCell>
                        <TableCell>{activity.boq_qty}</TableCell>
                        <TableCell>{activity.executed_qty}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${activity.progress_percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {activity.progress_percentage}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={currentQuantity}
                            onChange={(e) => handleQuantityChange(activity.id, Number(e.target.value))}
                            className="w-20"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={currentComment}
                            onChange={(e) => handleCommentChange(activity.id, e.target.value)}
                            placeholder="Comentario..."
                            className="w-32 h-8 text-xs"
                            rows={1}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {todayEntry ? (
                              <Badge variant="secondary" className="text-xs">
                                Guardado
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleSaveEntry(activity.id)}
                                disabled={isSaving || currentQuantity <= 0}
                              >
                                {isSaving ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Camera className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Submission */}
      <Card>
        <CardHeader>
          <CardTitle>Enviar Reporte Diario</CardTitle>
          <CardDescription>
            Agrega notas adicionales y envía el reporte para aprobación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notes">Notas del Reporte</Label>
            <Textarea
              id="notes"
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              placeholder="Agrega comentarios generales sobre el día de trabajo..."
              className="mt-1"
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {summary && (
                <span>
                  {summary.activitiesWithProgress} de {summary.totalActivities} actividades con progreso
                </span>
              )}
            </div>
            <Button 
              onClick={handleSubmitReport}
              disabled={isSubmitting || !summary || summary.activitiesWithProgress === 0}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Reporte
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}