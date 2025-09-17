import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertTriangle, Download, Loader2, X } from "lucide-react";
import { useImportPlan } from "@/hooks/useImportPlan";
import { toast } from "sonner";

export default function ImportPlan() {
  const [uploadStep, setUploadStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    importResult,
    processFile,
    importValidActivities,
    downloadTemplate,
    isImporting
  } = useImportPlan();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      const supportedFormats = ['.csv', '.xer', '.xml', '.mpp'];
      const isSupported = supportedFormats.some(format => fileName.endsWith(format));
      
      if (!isSupported) {
        toast.error('Formato no soportado. Use CSV, XER, XML o MPP');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      await processFile(selectedFile);
      setUploadStep(2);
      toast.success('Archivo procesado correctamente');
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error al procesar el archivo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    try {
      await importValidActivities();
      setUploadStep(3);
    } catch (error) {
      console.error('Error importing:', error);
    }
  };

  const resetImport = () => {
    setUploadStep(1);
    setSelectedFile(null);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Importar Plan de Actividades</h1>
          <p className="text-muted-foreground">
            Importa actividades desde un archivo CSV al proyecto
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => downloadTemplate('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Descargar CSV
          </Button>
          <Button variant="outline" onClick={() => downloadTemplate('xml')}>
            <Download className="w-4 h-4 mr-2" />
            Descargar XML
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-8">
        <div className={`flex items-center space-x-2 ${uploadStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            uploadStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            {uploadStep > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
          </div>
          <span className="font-medium">Subir Archivo</span>
        </div>
        <div className={`w-16 h-0.5 ${uploadStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`flex items-center space-x-2 ${uploadStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            uploadStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            {uploadStep > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}
          </div>
          <span className="font-medium">Revisar Datos</span>
        </div>
        <div className={`w-16 h-0.5 ${uploadStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`flex items-center space-x-2 ${uploadStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            uploadStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            3
          </div>
          <span className="font-medium">Importar</span>
        </div>
      </div>

      {/* Step 1: File Upload */}
      {uploadStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Paso 1: Seleccionar Archivo CSV</CardTitle>
            <CardDescription>
              Sube un archivo CSV con las actividades del proyecto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Arrastra tu archivo CSV aquí</h3>
                <p className="text-muted-foreground">
                  o haz clic para seleccionar un archivo
                </p>
              </div>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="mt-4 max-w-xs mx-auto"
              />
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleProcessFile} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Procesar Archivo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Formatos soportados:</strong> 
                <br />• CSV: project_code, area_name, system_name, activity_code, activity_name, unit, boq_qty, weight
                <br />• Primavera P6: Archivos .xer exportados desde P6
                <br />• Microsoft Project: Archivos .xml exportados desde Project
                <br />• Nota: Los archivos .mpp requieren conversión a .xml primero
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Review Data */}
      {uploadStep === 2 && importResult && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{importResult.totalRows}</p>
                    <p className="text-xs text-muted-foreground">Total Filas</p>
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
                    <p className="text-2xl font-bold">{importResult.validRows}</p>
                    <p className="text-xs text-muted-foreground">Válidas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{importResult.warningRows}</p>
                    <p className="text-xs text-muted-foreground">Advertencias</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{importResult.errorRows}</p>
                    <p className="text-xs text-muted-foreground">Errores</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa de los Datos</CardTitle>
              <CardDescription>
                Revisa los datos antes de importar. Solo se importarán las filas válidas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estado</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Actividad</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead>BOQ</TableHead>
                      <TableHead>Peso</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importResult.activities.map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge 
                            variant={
                              activity.status === 'valid' ? 'default' :
                              activity.status === 'warning' ? 'secondary' : 'destructive'
                            }
                          >
                            {activity.status === 'valid' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {activity.status === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {activity.status === 'error' && <X className="w-3 h-3 mr-1" />}
                            {activity.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{activity.activity_code}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={activity.activity_name}>
                            {activity.activity_name}
                          </div>
                        </TableCell>
                        <TableCell>{activity.unit}</TableCell>
                        <TableCell>{activity.boq_qty}</TableCell>
                        <TableCell>{activity.weight}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {activity.error_message || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={resetImport}>
              Volver
            </Button>
            <div className="flex items-center gap-2">
              {importResult.validRows > 0 ? (
                <Button onClick={handleImport} disabled={isImporting}>
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Importar {importResult.validRows} Actividades
                    </>
                  )}
                </Button>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No hay actividades válidas para importar. Revisa los errores y vuelve a intentar.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {uploadStep === 3 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  ¡Importación Exitosa!
                </h3>
                <p className="text-muted-foreground">
                  Las actividades han sido importadas correctamente al proyecto.
                </p>
              </div>
              <div className="flex items-center justify-center gap-4">
                <Button onClick={resetImport}>
                  Importar Otro Archivo
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/capture'}>
                  Ir a Captura de Avances
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}