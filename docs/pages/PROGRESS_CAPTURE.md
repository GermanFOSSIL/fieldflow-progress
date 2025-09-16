# Progress Capture - Documentación

## 📋 Propósito y Funcionalidad

La página **Progress Capture** (`/capture`) es donde los trabajadores de campo registran diariamente el avance de las actividades de construcción, incluyendo cantidades completadas, fotos de progreso y ubicación GPS.

## 🎯 Características Principales

### 1. **Formulario de Captura de Avance**
- Selección de actividades por proyecto
- Entrada de cantidades completadas
- Comentarios y observaciones
- Captura automática de GPS

### 2. **Gestión de Fotos**
- Subida múltiple de imágenes
- Preview antes de envío
- Compresión automática
- Almacenamiento en Supabase Storage

### 3. **Validación y Estados**
- Validación en tiempo real
- Estados de borrador y envío
- Confirmación de ubicación
- Verificación de datos

## 💻 Implementación Técnica

### Estructura Principal del Componente
```typescript
// src/pages/ProgressCapture.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";

// Schema de validación
const progressSchema = z.object({
  reportDate: z.date(),
  shift: z.enum(["morning", "afternoon", "night"]),
  activities: z.array(z.object({
    activityId: z.string().uuid(),
    qtyToday: z.number().min(0),
    comment: z.string().optional()
  })).min(1, "Debe incluir al menos una actividad"),
  generalNotes: z.string().optional(),
  photos: z.array(z.instanceof(File)).max(10, "Máximo 10 fotos")
});

export default function ProgressCapture() {
  const { user } = useAuth();
  const { selectedProject } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState(null);
  
  const form = useForm({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      reportDate: new Date(),
      shift: "morning",
      activities: [],
      generalNotes: "",
      photos: []
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProgressCaptureHeader />
      <ProgressForm />
      <PhotoUploadSection />
      <LocationSection />
      <SubmitSection />
    </div>
  );
}
```

### Formulario de Actividades
```typescript
const ActivitySelector = ({ form, activities }) => {
  const [selectedActivities, setSelectedActivities] = useState([]);
  
  const addActivity = (activity) => {
    const newActivity = {
      activityId: activity.id,
      activityName: activity.name,
      unit: activity.unit,
      qtyToday: 0,
      comment: ""
    };
    
    setSelectedActivities(prev => [...prev, newActivity]);
    form.setValue("activities", [...selectedActivities, newActivity]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividades del Día</CardTitle>
        <CardDescription>
          Selecciona las actividades realizadas y registra las cantidades
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Activity Selection Dropdown */}
        <div className="mb-4">
          <Select onValueChange={(value) => {
            const activity = activities.find(a => a.id === value);
            if (activity) addActivity(activity);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una actividad" />
            </SelectTrigger>
            <SelectContent>
              {activities.map((activity) => (
                <SelectItem key={activity.id} value={activity.id}>
                  {activity.name} ({activity.unit})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Activities List */}
        <div className="space-y-4">
          {selectedActivities.map((activity, index) => (
            <ActivityEntry
              key={activity.activityId}
              activity={activity}
              index={index}
              form={form}
              onRemove={() => removeActivity(index)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
```

### Componente de Entrada de Actividad
```typescript
const ActivityEntry = ({ activity, index, form, onRemove }) => {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{activity.activityName}</h4>
          <p className="text-sm text-muted-foreground">
            Unidad: {activity.unit}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`qty-${index}`}>Cantidad Realizada</Label>
          <Input
            id={`qty-${index}`}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...form.register(`activities.${index}.qtyToday`, {
              valueAsNumber: true
            })}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {activity.unit}
          </p>
        </div>
        
        <div>
          <Label htmlFor={`comment-${index}`}>Comentarios</Label>
          <Textarea
            id={`comment-${index}`}
            placeholder="Observaciones sobre esta actividad..."
            rows={3}
            {...form.register(`activities.${index}.comment`)}
          />
        </div>
      </div>
    </div>
  );
};
```

## 📸 Sistema de Fotos

### Componente de Subida de Fotos
```typescript
const PhotoUploadSection = ({ form }) => {
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const handlePhotoUpload = async (files: FileList) => {
    const newPhotos = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    );
    
    // Generate previews
    const photosWithPreviews = await Promise.all(
      newPhotos.map(async (file) => ({
        file,
        preview: await generatePreview(file),
        id: crypto.randomUUID()
      }))
    );
    
    setPhotos(prev => [...prev, ...photosWithPreviews]);
    form.setValue("photos", [...photos.map(p => p.file), ...newPhotos]);
  };

  const generatePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fotos de Progreso</CardTitle>
        <CardDescription>
          Sube fotos que documenten el avance realizado (máximo 10 fotos, 5MB cada una)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
            onClick={() => document.getElementById('photo-upload')?.click()}
          >
            <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Haz clic para seleccionar fotos o arrastra y suelta aquí
            </p>
            <input
              id="photo-upload"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)}
            />
          </div>

          {/* Photo Previews */}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <PhotoPreview
                  key={photo.id}
                  photo={photo}
                  onRemove={() => removePhoto(photo.id)}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

### Preview de Fotos
```typescript
const PhotoPreview = ({ photo, onRemove }) => (
  <div className="relative group">
    <img
      src={photo.preview}
      alt="Preview"
      className="w-full h-24 object-cover rounded-lg border"
    />
    <Button
      variant="destructive"
      size="sm"
      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={onRemove}
    >
      <X className="h-3 w-3" />
    </Button>
    <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
      {(photo.file.size / 1024 / 1024).toFixed(1)}MB
    </div>
  </div>
);
```

## 🌍 Sistema de Geolocalización

### Captura de GPS
```typescript
const LocationSection = ({ location, setLocation }) => {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocalización no soportada por este navegador");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
          timestamp: new Date().toISOString()
        });
        setIsLoadingLocation(false);
      },
      (error) => {
        let errorMessage = "Error al obtener ubicación";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso de ubicación denegado";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Información de ubicación no disponible";
            break;
          case error.TIMEOUT:
            errorMessage = "Tiempo de espera agotado";
            break;
        }
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubicación GPS</CardTitle>
        <CardDescription>
          Registra tu ubicación para verificar el sitio de trabajo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            className="w-full"
          >
            {isLoadingLocation ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Obteniendo ubicación...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Obtener Ubicación Actual
              </>
            )}
          </Button>

          {location && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Ubicación obtenida</span>
              </div>
              <div className="text-sm text-green-600 space-y-1">
                <div>Latitud: {location.lat.toFixed(6)}</div>
                <div>Longitud: {location.lng.toFixed(6)}</div>
                <div>Precisión: ±{location.accuracy}m</div>
                <div>Hora: {new Date(location.timestamp).toLocaleString()}</div>
              </div>
            </div>
          )}

          {locationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Error de ubicación</span>
              </div>
              <p className="text-sm text-red-600 mt-1">{locationError}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

## 💾 Envío y Persistencia

### Función de Envío del Reporte
```typescript
const handleSubmit = async (data) => {
  setIsSubmitting(true);
  
  try {
    // 1. Create daily report
    const { data: report, error: reportError } = await supabase
      .from('daily_reports')
      .insert({
        project_id: selectedProject.id,
        reporter_id: user.id,
        report_date: data.reportDate.toISOString().split('T')[0],
        shift: data.shift,
        status: 'sent', // Enviado para aprobación
        gps_lat: location?.lat,
        gps_lng: location?.lng,
        notes: data.generalNotes
      })
      .select()
      .single();

    if (reportError) throw reportError;

    // 2. Upload photos to Supabase Storage
    const photoUrls = await uploadPhotos(data.photos, report.id);

    // 3. Create progress entries
    const progressEntries = data.activities.map(activity => ({
      daily_report_id: report.id,
      activity_id: activity.activityId,
      qty_today: activity.qtyToday,
      comment: activity.comment,
      photo_urls: photoUrls
    }));

    const { error: entriesError } = await supabase
      .from('progress_entries')
      .insert(progressEntries);

    if (entriesError) throw entriesError;

    // 4. Show success message and reset form
    toast({
      title: "Reporte enviado exitosamente",
      description: "Tu reporte ha sido enviado para aprobación del supervisor",
    });

    form.reset();
    setPhotos([]);
    setLocation(null);

  } catch (error) {
    console.error('Error submitting report:', error);
    toast({
      title: "Error al enviar reporte",
      description: error.message,
      variant: "destructive"
    });
  } finally {
    setIsSubmitting(false);
  }
};
```

### Subida de Fotos a Supabase Storage
```typescript
const uploadPhotos = async (photos: File[], reportId: string): Promise<string[]> => {
  const uploadPromises = photos.map(async (photo, index) => {
    const fileName = `${reportId}/photo_${index}_${Date.now()}.jpg`;
    const filePath = `progress-photos/${fileName}`;
    
    // Compress photo before upload
    const compressedFile = await compressImage(photo);
    
    const { data, error } = await supabase.storage
      .from('progress-photos')
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return filePath;
  });

  return Promise.all(uploadPromises);
};

const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        }));
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
```

## 🔄 Estados y Validación

### Estados del Formulario
```typescript
const [formState, setFormState] = useState({
  isLoading: false,
  isDraft: false,
  hasUnsavedChanges: false,
  validationErrors: []
});

// Auto-save as draft
useEffect(() => {
  const autoSave = debounce(() => {
    if (form.formState.isDirty) {
      saveDraft();
    }
  }, 2000);

  const subscription = form.watch(() => {
    setFormState(prev => ({ ...prev, hasUnsavedChanges: true }));
    autoSave();
  });

  return () => {
    subscription.unsubscribe();
    autoSave.cancel();
  };
}, [form]);
```

### Validación Personalizada
```typescript
const validateQuantities = (activities: ActivityEntry[]) => {
  const errors = [];
  
  activities.forEach((activity, index) => {
    if (activity.qtyToday < 0) {
      errors.push(`Actividad ${index + 1}: La cantidad no puede ser negativa`);
    }
    
    if (activity.qtyToday > activity.boqQty * 1.1) {
      errors.push(`Actividad ${index + 1}: La cantidad excede significativamente lo planificado`);
    }
  });
  
  return errors;
};
```

## 📊 Tipos de Datos

### Interfaces TypeScript
```typescript
interface ProgressCaptureForm {
  reportDate: Date;
  shift: 'morning' | 'afternoon' | 'night';
  activities: ActivityEntry[];
  generalNotes?: string;
  photos: File[];
}

interface ActivityEntry {
  activityId: string;
  activityName: string;
  unit: string;
  qtyToday: number;
  comment?: string;
  boqQty: number; // For validation
}

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
}

interface PhotoData {
  file: File;
  preview: string;
  id: string;
}
```

## 🔒 Seguridad y Validación

### Políticas RLS
```sql
-- Solo el reporter puede crear sus reportes
CREATE POLICY "Los reporteros pueden crear sus propios reportes" 
ON daily_reports FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

-- Solo pueden editar reportes en estado draft
CREATE POLICY "Los reporteros pueden actualizar sus reportes draft" 
ON daily_reports FOR UPDATE 
USING (
  auth.uid() = reporter_id 
  AND status IN ('draft', 'sent')
);
```

### Validación del Lado del Servidor
```sql
-- Trigger para validar datos antes de insertar
CREATE OR REPLACE FUNCTION validate_progress_entry()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar que la cantidad no sea negativa
  IF NEW.qty_today < 0 THEN
    RAISE EXCEPTION 'La cantidad no puede ser negativa';
  END IF;
  
  -- Validar que el reporte pertenece al usuario
  IF NOT EXISTS (
    SELECT 1 FROM daily_reports 
    WHERE id = NEW.daily_report_id 
    AND reporter_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No tienes permisos para este reporte';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_progress_entry_trigger
  BEFORE INSERT OR UPDATE ON progress_entries
  FOR EACH ROW EXECUTE FUNCTION validate_progress_entry();
```

---
**Documentado por**: Equipo de Frontend  
**Última actualización**: Enero 2025