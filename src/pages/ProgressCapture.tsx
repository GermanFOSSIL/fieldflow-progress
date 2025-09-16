import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Camera, Search, Save, Send, Plus } from "lucide-react";

export default function ProgressCapture() {
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState("");
  
  // Mock data for activities
  const activities = [
    {
      id: "A-0001",
      name: "Soldadura spool 2\"",
      unit: "u",
      boqQty: 120,
      executed: 78,
      todayQty: 0,
      progress: 65,
      comment: "",
      photos: []
    },
    {
      id: "A-0002", 
      name: "Soportes tubería",
      unit: "m",
      boqQty: 300,
      executed: 185,
      todayQty: 0,
      progress: 62,
      comment: "",
      photos: []
    },
    {
      id: "A-0101",
      name: "Tendido bandeja principal",
      unit: "m", 
      boqQty: 200,
      executed: 145,
      todayQty: 0,
      progress: 73,
      comment: "",
      photos: []
    }
  ];

  const [progressEntries, setProgressEntries] = useState(activities);

  const updateEntry = (id: string, field: string, value: any) => {
    setProgressEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Carga Diaria de Avances</h1>
          <p className="text-muted-foreground">Registrar el progreso de construcción de hoy</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Optimizado para Móvil
        </Badge>
      </div>

      {/* Project Selection */}
      <Card className="construction-card">
        <CardHeader>
          <CardTitle className="text-lg">Detalles del Parte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="project">Proyecto</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FP01">FieldProgress Demo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="shift">Turno</Label>
              <Select value={selectedShift} onValueChange={setSelectedShift}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DIA">Día</SelectItem>
                  <SelectItem value="NOCHE">Noche</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Search */}
      <Card className="construction-card">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por código o nombre de actividad..."
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Actividad
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Entry Table */}
      <Card className="construction-card">
        <CardHeader>
          <CardTitle>Progreso de Hoy</CardTitle>
          <CardDescription>Ingresar cantidades completadas hoy para cada actividad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Actividad</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Cant. BOQ</TableHead>
                  <TableHead>Ejecutado</TableHead>
                  <TableHead>Hoy</TableHead>
                  <TableHead>Progreso %</TableHead>
                  <TableHead>Comentario</TableHead>
                  <TableHead>Fotos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {progressEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono font-medium">{entry.id}</TableCell>
                    <TableCell>{entry.name}</TableCell>
                    <TableCell className="font-mono">{entry.unit}</TableCell>
                    <TableCell className="font-mono">{entry.boqQty}</TableCell>
                    <TableCell className="font-mono">{entry.executed}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={entry.todayQty}
                        onChange={(e) => updateEntry(entry.id, 'todayQty', parseFloat(e.target.value) || 0)}
                        className="w-20 font-mono"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={entry.progress > 80 ? "default" : entry.progress > 50 ? "secondary" : "outline"}
                      >
                        {entry.progress}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={entry.comment}
                        onChange={(e) => updateEntry(entry.id, 'comment', e.target.value)}
                        placeholder="Comentarios..."
                        className="min-w-[200px] min-h-[60px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        Agregar ({entry.photos.length})
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">
          <Save className="mr-2 h-4 w-4" />
          Guardar Borrador
        </Button>
        <Button variant="default" className="bg-primary text-white">
          <Send className="mr-2 h-4 w-4" />
          Enviar para Aprobación
        </Button>
      </div>
    </div>
  );
}