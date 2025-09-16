import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertTriangle, Download } from "lucide-react";

export default function ImportPlan() {
  const [uploadStep, setUploadStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Mock preview data
  const previewData = [
    {
      projectCode: "FP01",
      areaName: "Área 1", 
      systemName: "Sistema Proceso",
      activityCode: "A-0001",
      activityName: "Soldadura spool 2\"",
      unit: "u",
      boqQty: 120,
      weight: 0.20,
      status: "valid"
    },
    {
      projectCode: "FP01",
      areaName: "Área 1",
      systemName: "Sistema Eléctrico", 
      activityCode: "A-0101",
      activityName: "Tendido bandeja principal",
      unit: "m",
      boqQty: 200,
      weight: 0.25,
      status: "valid"
    },
    {
      projectCode: "FP01",
      areaName: "Área 2",
      systemName: "Sistema Instrumentos",
      activityCode: "A-0205",
      activityName: "Instalación transmisores",
      unit: "u", 
      boqQty: 40,
      weight: 0.15,
      status: "warning"
    }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStep(2);
    }
  };

  const handleImport = () => {
    setUploadStep(3);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Importar Plan del Proyecto</h1>
          <p className="text-muted-foreground">Subir archivos CSV/Excel para crear estructura del proyecto y actividades</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Descargar Plantillas
        </Button>
      </div>

      {/* Upload Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${uploadStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            1
          </div>
          <div className={`w-12 h-1 ${uploadStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${uploadStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            2
          </div>
          <div className={`w-12 h-1 ${uploadStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${uploadStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            3
          </div>
        </div>
      </div>

      {/* Step 1: Upload File */}
      {uploadStep === 1 && (
        <Card className="construction-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Paso 1: Seleccionar Archivo
            </CardTitle>
            <CardDescription>
              Subir tu plan de proyecto en formato CSV o Excel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Arrastra tu archivo aquí</p>
                <p className="text-sm text-muted-foreground">
                  Soporta archivos CSV y Excel hasta 10MB
                </p>
                <div className="pt-4">
                  <Label htmlFor="file-upload">
                    <Button variant="default" className="bg-primary text-white cursor-pointer">
                      Elegir Archivo
                    </Button>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </Label>
                </div>
              </div>
            </div>

            <Alert className="mt-6">
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Asegúrate de que tu archivo incluya las columnas: project_code, area_name, system_name, activity_code, activity_name, unit, boq_qty, weight
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Preview and Validate */}
      {uploadStep === 2 && (
        <div className="space-y-6">
          <Card className="construction-card">
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Paso 2: Previsualizar y Validar
            </CardTitle>
            <CardDescription>
              Revisar los datos importados antes de procesarlos
            </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">Archivo: {selectedFile?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {previewData.length} actividades encontradas
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="default">
                    {previewData.filter(item => item.status === 'valid').length} Válidos
                  </Badge>
                  <Badge variant="secondary">
                    {previewData.filter(item => item.status === 'warning').length} Advertencias
                  </Badge>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estado</TableHead>
                      <TableHead>Proyecto</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Sistema</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Actividad</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Cant. BOQ</TableHead>
                      <TableHead>Peso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {row.status === 'valid' ? (
                            <CheckCircle className="h-4 w-4 text-chart-success" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-chart-warning" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono">{row.projectCode}</TableCell>
                        <TableCell>{row.areaName}</TableCell>
                        <TableCell>{row.systemName}</TableCell>
                        <TableCell className="font-mono font-medium">{row.activityCode}</TableCell>
                        <TableCell>{row.activityName}</TableCell>
                        <TableCell className="font-mono">{row.unit}</TableCell>
                        <TableCell className="font-mono">{row.boqQty}</TableCell>
                        <TableCell className="font-mono">{row.weight}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <Button variant="outline" onClick={() => setUploadStep(1)}>
                  Atrás
                </Button>
                <Button variant="default" className="bg-primary text-white" onClick={handleImport}>
                  Importar Datos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Import Complete */}
      {uploadStep === 3 && (
        <Card className="construction-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-chart-success">
              <CheckCircle className="h-5 w-5" />
              Importación Completa
            </CardTitle>
            <CardDescription>
              Tu plan del proyecto ha sido importado exitosamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-16 w-16 text-chart-success mb-4" />
              <h3 className="text-lg font-semibold mb-2">Importado Exitosamente</h3>
              <p className="text-muted-foreground mb-6">
                {previewData.length} actividades han sido agregadas a tu proyecto
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => setUploadStep(1)}>
                  Importar Otro Archivo
                </Button>
                <Button variant="default" className="bg-primary text-white">
                  Ver Panel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}