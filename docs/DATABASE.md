# Database Schema - FieldProgress

## 📊 Estructura Completa de la Base de Datos

### Diagrama ERD Conceptual
```
PROJECTS
├── AREAS
│   ├── SYSTEMS
│   │   ├── SUBSYSTEMS
│   │   │   └── WORK_PACKAGES
│   │   │       └── ACTIVITIES
│   │   │           └── PROGRESS_ENTRIES
│   │   │               └── DAILY_REPORTS
│   └── USERS (profiles)
└── WHATSAPP_CONVERSATIONS
    ├── WHATSAPP_CONTACTS
    └── WHATSAPP_MESSAGES
```

## 🗂️ Tablas Detalladas

### **projects**
**Propósito**: Almacena información de proyectos de construcción

```sql
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active'::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Políticas RLS**:
- Usuarios autenticados pueden ver proyectos
- Solo supervisores pueden modificar proyectos

**Ejemplo de datos**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Torre Residencial Las Palmas",
  "code": "TRP-2024-001",
  "status": "active"
}
```

### **areas**
**Propósito**: Divisiones geográficas o funcionales del proyecto

```sql
CREATE TABLE public.areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Ejemplo de datos**:
```json
{
  "id": "234e5678-e89b-12d3-a456-426614174001",
  "project_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Torre A",
  "code": "TA"
}
```

### **systems**
**Propósito**: Sistemas constructivos (estructura, MEP, etc.)

```sql
CREATE TABLE public.systems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area_id UUID REFERENCES areas(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### **activities**
**Propósito**: Actividades específicas de construcción

```sql
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_package_id UUID REFERENCES work_packages(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  boq_qty NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Campos Importantes**:
- `boq_qty`: Cantidad total en Bill of Quantities
- `unit`: Unidad de medida (m², m³, ton, etc.)
- `weight`: Peso relativo en el proyecto (0-1)

**Ejemplo de datos**:
```json
{
  "id": "345e6789-e89b-12d3-a456-426614174002",
  "name": "Estructura Torre A - Nivel 1",
  "code": "EST-TA-N01",
  "boq_qty": 120.5,
  "unit": "m³",
  "weight": 0.15
}
```

### **daily_reports**
**Propósito**: Reportes diarios de avance enviados por trabajadores

```sql
CREATE TABLE public.daily_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  reporter_id UUID REFERENCES auth.users(id),
  supervisor_id UUID REFERENCES auth.users(id),
  report_date DATE NOT NULL,
  shift TEXT NOT NULL,
  status TEXT DEFAULT 'draft'::text,
  gps_lat NUMERIC,
  gps_lng NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE
);
```

**Estados posibles**:
- `draft`: Borrador
- `sent`: Enviado para aprobación
- `approved`: Aprobado por supervisor
- `rejected`: Rechazado con comentarios

**Políticas RLS**:
```sql
-- Reporteros pueden ver sus propios reportes
CREATE POLICY "Los reporteros pueden ver sus propios reportes" 
ON daily_reports FOR SELECT 
USING (auth.uid() = reporter_id);

-- Supervisores pueden ver todos los reportes
CREATE POLICY "Los supervisores pueden ver todos los reportes" 
ON daily_reports FOR SELECT 
USING (get_user_role() = 'supervisor'::text);
```

### **progress_entries**
**Propósito**: Entradas específicas de progreso por actividad

```sql
CREATE TABLE public.progress_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  daily_report_id UUID REFERENCES daily_reports(id),
  activity_id UUID REFERENCES activities(id),
  qty_today NUMERIC NOT NULL DEFAULT 0,
  comment TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Ejemplo de datos**:
```json
{
  "id": "456e7890-e89b-12d3-a456-426614174003",
  "daily_report_id": "567e8901-e89b-12d3-a456-426614174004",
  "activity_id": "345e6789-e89b-12d3-a456-426614174002",
  "qty_today": 15.5,
  "comment": "Avance normal, buen clima",
  "photo_urls": [
    "progress-photos/report_567/photo1.jpg",
    "progress-photos/report_567/photo2.jpg"
  ]
}
```

### **activity_progress_agg**
**Propósito**: Tabla agregada con progreso acumulado por actividad

```sql
CREATE TABLE public.activity_progress_agg (
  activity_id UUID NOT NULL PRIMARY KEY REFERENCES activities(id),
  qty_accum NUMERIC NOT NULL DEFAULT 0,
  pct NUMERIC NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Actualización automática**: Se actualiza via triggers cuando se aprueban reportes

### **profiles/users**
**Propósito**: Perfiles de usuario extendidos

```sql
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'reporter'::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Roles disponibles**:
- `reporter`: Trabajador de campo
- `supervisor`: Supervisor/Manager
- `admin`: Administrador del sistema

## 📱 WhatsApp Tables

### **whatsapp_contacts**
```sql
CREATE TABLE public.whatsapp_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT DEFAULT 'worker'::text,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### **whatsapp_conversations**
```sql
CREATE TABLE public.whatsapp_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES whatsapp_contacts(id),
  project_id UUID REFERENCES projects(id),
  title TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### **whatsapp_messages**
```sql
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES whatsapp_conversations(id),
  sender_type TEXT NOT NULL, -- 'user' | 'bot'
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text'::text,
  template_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### **whatsapp_templates**
```sql
CREATE TABLE public.whatsapp_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL, -- 'menu' | 'progress_form' | 'notification'
  content JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Ejemplo de content para template**:
```json
{
  "title": "Reporte de Avance Diario",
  "fields": [
    {
      "name": "activity",
      "label": "Actividad",
      "type": "select",
      "required": true
    },
    {
      "name": "quantity",
      "label": "Cantidad",
      "type": "number",
      "required": true
    }
  ]
}
```

## 🔧 Funciones de Base de Datos

### **get_user_role()**
```sql
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;
```

### **update_activity_progress()**
```sql
CREATE OR REPLACE FUNCTION public.update_activity_progress()
RETURNS trigger
AS $$
DECLARE
  activity_record RECORD;
  new_qty_accum NUMERIC;
  new_pct NUMERIC;
BEGIN
  -- Calcula progreso acumulado solo de reportes aprobados
  -- Ver código completo en supabase/functions
END;
$$;
```

### **handle_report_approval()**
```sql
CREATE OR REPLACE FUNCTION public.handle_report_approval()
RETURNS trigger
AS $$
BEGIN
  -- Actualiza progreso cuando reporte es aprobado
  IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
    PERFORM update_activity_progress();
  END IF;
  RETURN NEW;
END;
$$;
```

## 🔐 Seguridad y RLS

### Políticas Principales

1. **Separation by Role**:
   - Reporters: Solo sus datos
   - Supervisors: Todos los datos del proyecto
   - Admins: Acceso completo

2. **Data Isolation**:
   - Reportes draft solo visibles por el autor
   - Reportes aprobados visibles por todos
   - Progreso agregado calculado automáticamente

3. **Audit Trail**:
   - Tabla `audit_logs` para todas las operaciones críticas
   - Triggers automáticos en cambios importantes

### Ejemplo de Política RLS
```sql
CREATE POLICY "Usuarios pueden ver sus propios reportes"
ON daily_reports
FOR SELECT
USING (
  auth.uid() = reporter_id 
  OR 
  get_user_role() = 'supervisor'
);
```

## 📈 Índices y Performance

### Índices Principales
```sql
-- Búsquedas frecuentes
CREATE INDEX idx_daily_reports_date ON daily_reports(report_date);
CREATE INDEX idx_daily_reports_status ON daily_reports(status);
CREATE INDEX idx_progress_entries_activity ON progress_entries(activity_id);
CREATE INDEX idx_whatsapp_messages_conversation ON whatsapp_messages(conversation_id);

-- Índices compuestos para queries complejas
CREATE INDEX idx_reports_project_date ON daily_reports(project_id, report_date);
CREATE INDEX idx_progress_activity_date ON progress_entries(activity_id, created_at);
```

## 🔄 Triggers y Automatización

### Update Timestamps
```sql
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### Progress Calculation
```sql
CREATE TRIGGER trigger_update_progress
AFTER INSERT OR UPDATE OR DELETE ON progress_entries
FOR EACH ROW
EXECUTE FUNCTION update_activity_progress();
```

### Report Approval
```sql
CREATE TRIGGER trigger_report_approval
AFTER UPDATE ON daily_reports
FOR EACH ROW
EXECUTE FUNCTION handle_report_approval();
```

---
**Mantenido por**: Equipo de Base de Datos  
**Última actualización**: Enero 2025