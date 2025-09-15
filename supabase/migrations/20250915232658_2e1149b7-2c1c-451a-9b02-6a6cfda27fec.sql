-- Estructura completa de base de datos para FieldProgress

-- Tabla de proyectos
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de áreas
CREATE TABLE public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, code)
);

-- Tabla de sistemas
CREATE TABLE public.systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID REFERENCES public.areas(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(area_id, code)
);

-- Tabla de subsistemas
CREATE TABLE public.subsystems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id UUID REFERENCES public.systems(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(system_id, code)
);

-- Tabla de paquetes de trabajo
CREATE TABLE public.work_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subsystem_id UUID REFERENCES public.subsystems(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  contractor TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(subsystem_id, code)
);

-- Tabla de actividades
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_package_id UUID REFERENCES public.work_packages(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  boq_qty NUMERIC NOT NULL CHECK (boq_qty >= 0),
  weight NUMERIC NOT NULL DEFAULT 0 CHECK (weight >= 0 AND weight <= 1),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(work_package_id, code)
);

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'reporter' CHECK (role IN ('reporter', 'supervisor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de reportes diarios
CREATE TABLE public.daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE RESTRICT,
  report_date DATE NOT NULL,
  shift TEXT NOT NULL CHECK (shift IN ('DIA', 'NOCHE')),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
  supervisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved')),
  gps_lat NUMERIC,
  gps_lng NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  UNIQUE(project_id, report_date, shift, reporter_id)
);

-- Tabla de entradas de progreso
CREATE TABLE public.progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_report_id UUID REFERENCES public.daily_reports(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE RESTRICT,
  qty_today NUMERIC NOT NULL DEFAULT 0 CHECK (qty_today >= 0),
  comment TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de cierres diarios
CREATE TABLE public.daily_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE RESTRICT,
  closed_date DATE NOT NULL,
  closed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  closed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, closed_date)
);

-- Tabla de progreso acumulado (para performance)
CREATE TABLE public.activity_progress_agg (
  activity_id UUID PRIMARY KEY REFERENCES public.activities(id) ON DELETE CASCADE,
  qty_accum NUMERIC NOT NULL DEFAULT 0,
  pct NUMERIC NOT NULL DEFAULT 0 CHECK (pct >= 0 AND pct <= 1),
  last_updated TIMESTAMPTZ DEFAULT now()
);

-- Tabla de auditoría
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts TIMESTAMPTZ DEFAULT now(),
  actor UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  meta JSONB
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subsystems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_progress_agg ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Políticas RLS para projects
CREATE POLICY "Todos pueden ver proyectos" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Solo supervisores pueden modificar proyectos" ON public.projects FOR ALL USING (public.get_user_role() = 'supervisor');

-- Políticas RLS para areas, systems, subsystems, work_packages
CREATE POLICY "Todos pueden ver áreas" ON public.areas FOR SELECT USING (true);
CREATE POLICY "Solo supervisores pueden modificar áreas" ON public.areas FOR ALL USING (public.get_user_role() = 'supervisor');

CREATE POLICY "Todos pueden ver sistemas" ON public.systems FOR SELECT USING (true);
CREATE POLICY "Solo supervisores pueden modificar sistemas" ON public.systems FOR ALL USING (public.get_user_role() = 'supervisor');

CREATE POLICY "Todos pueden ver subsistemas" ON public.subsystems FOR SELECT USING (true);
CREATE POLICY "Solo supervisores pueden modificar subsistemas" ON public.subsystems FOR ALL USING (public.get_user_role() = 'supervisor');

CREATE POLICY "Todos pueden ver paquetes de trabajo" ON public.work_packages FOR SELECT USING (true);
CREATE POLICY "Solo supervisores pueden modificar paquetes de trabajo" ON public.work_packages FOR ALL USING (public.get_user_role() = 'supervisor');

-- Políticas RLS para activities
CREATE POLICY "Todos pueden ver actividades" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Solo supervisores pueden modificar actividades" ON public.activities FOR ALL USING (public.get_user_role() = 'supervisor');

-- Políticas RLS para profiles
CREATE POLICY "Los usuarios pueden ver sus propios perfiles" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Los usuarios pueden actualizar sus propios perfiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Los supervisores pueden ver todos los perfiles" ON public.profiles FOR SELECT USING (public.get_user_role() = 'supervisor');

-- Políticas RLS para daily_reports
CREATE POLICY "Los reporteros pueden ver sus propios reportes" ON public.daily_reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Los reporteros pueden crear sus propios reportes" ON public.daily_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Los reporteros pueden actualizar sus reportes draft/sent" ON public.daily_reports FOR UPDATE USING (auth.uid() = reporter_id AND status IN ('draft', 'sent'));
CREATE POLICY "Los supervisores pueden ver todos los reportes" ON public.daily_reports FOR SELECT USING (public.get_user_role() = 'supervisor');
CREATE POLICY "Los supervisores pueden aprobar reportes" ON public.daily_reports FOR UPDATE USING (public.get_user_role() = 'supervisor');

-- Políticas RLS para progress_entries
CREATE POLICY "Los usuarios pueden ver entradas de progreso de sus reportes" ON public.progress_entries FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.daily_reports dr WHERE dr.id = daily_report_id AND dr.reporter_id = auth.uid())
);
CREATE POLICY "Los reporteros pueden crear entradas de progreso" ON public.progress_entries FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.daily_reports dr WHERE dr.id = daily_report_id AND dr.reporter_id = auth.uid())
);
CREATE POLICY "Los reporteros pueden actualizar entradas de reportes no aprobados" ON public.progress_entries FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.daily_reports dr WHERE dr.id = daily_report_id AND dr.reporter_id = auth.uid() AND dr.status != 'approved')
);
CREATE POLICY "Los supervisores pueden ver todas las entradas de progreso" ON public.progress_entries FOR SELECT USING (public.get_user_role() = 'supervisor');
CREATE POLICY "Los supervisores pueden actualizar entradas de progreso" ON public.progress_entries FOR UPDATE USING (public.get_user_role() = 'supervisor');

-- Políticas RLS para daily_closures
CREATE POLICY "Todos pueden ver cierres diarios" ON public.daily_closures FOR SELECT USING (true);
CREATE POLICY "Solo supervisores pueden crear cierres diarios" ON public.daily_closures FOR INSERT WITH CHECK (public.get_user_role() = 'supervisor');

-- Políticas RLS para activity_progress_agg
CREATE POLICY "Todos pueden ver progreso acumulado" ON public.activity_progress_agg FOR SELECT USING (true);
CREATE POLICY "Solo el sistema puede modificar progreso acumulado" ON public.activity_progress_agg FOR ALL USING (false);

-- Políticas RLS para audit_logs
CREATE POLICY "Los supervisores pueden ver logs de auditoría" ON public.audit_logs FOR SELECT USING (public.get_user_role() = 'supervisor');

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_daily_reports_updated_at BEFORE UPDATE ON public.daily_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_progress_entries_updated_at BEFORE UPDATE ON public.progress_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'reporter');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar progreso acumulado
CREATE OR REPLACE FUNCTION public.update_activity_progress()
RETURNS TRIGGER AS $$
DECLARE
  activity_record RECORD;
  new_qty_accum NUMERIC;
  new_pct NUMERIC;
BEGIN
  -- Obtener información de la actividad
  SELECT a.id, a.boq_qty INTO activity_record
  FROM public.activities a
  INNER JOIN public.progress_entries pe ON pe.activity_id = a.id
  WHERE pe.id = COALESCE(NEW.id, OLD.id);
  
  -- Calcular nuevo acumulado solo de reportes aprobados
  SELECT COALESCE(SUM(pe.qty_today), 0) INTO new_qty_accum
  FROM public.progress_entries pe
  INNER JOIN public.daily_reports dr ON dr.id = pe.daily_report_id
  WHERE pe.activity_id = activity_record.id
    AND dr.status = 'approved';
  
  -- Limitar a 100% (no exceder BOQ)
  new_qty_accum := LEAST(new_qty_accum, activity_record.boq_qty);
  
  -- Calcular porcentaje
  new_pct := CASE 
    WHEN activity_record.boq_qty > 0 THEN new_qty_accum / activity_record.boq_qty
    ELSE 0
  END;
  
  -- Insertar o actualizar en activity_progress_agg
  INSERT INTO public.activity_progress_agg (activity_id, qty_accum, pct, last_updated)
  VALUES (activity_record.id, new_qty_accum, new_pct, now())
  ON CONFLICT (activity_id) 
  DO UPDATE SET 
    qty_accum = EXCLUDED.qty_accum,
    pct = EXCLUDED.pct,
    last_updated = EXCLUDED.last_updated;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar progreso cuando se aprueba un reporte
CREATE OR REPLACE FUNCTION public.handle_report_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo ejecutar cuando el status cambia a 'approved'
  IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
    -- Actualizar progreso para todas las actividades del reporte
    PERFORM public.update_activity_progress()
    FROM public.progress_entries pe
    WHERE pe.daily_report_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_daily_report_approved
  AFTER UPDATE ON public.daily_reports
  FOR EACH ROW
  WHEN (OLD.status != NEW.status AND NEW.status = 'approved')
  EXECUTE FUNCTION public.handle_report_approval();

-- Función para logging de auditoría
CREATE OR REPLACE FUNCTION public.log_audit(
  p_action TEXT,
  p_entity TEXT,
  p_entity_id UUID,
  p_meta JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs (actor, action, entity, entity_id, meta)
  VALUES (auth.uid(), p_action, p_entity, p_entity_id, p_meta);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Índices para performance
CREATE INDEX idx_areas_project_id ON public.areas(project_id);
CREATE INDEX idx_systems_area_id ON public.systems(area_id);
CREATE INDEX idx_subsystems_system_id ON public.subsystems(system_id);
CREATE INDEX idx_work_packages_subsystem_id ON public.work_packages(subsystem_id);
CREATE INDEX idx_activities_work_package_id ON public.activities(work_package_id);
CREATE INDEX idx_daily_reports_project_date ON public.daily_reports(project_id, report_date);
CREATE INDEX idx_daily_reports_status ON public.daily_reports(status);
CREATE INDEX idx_progress_entries_activity_id ON public.progress_entries(activity_id);
CREATE INDEX idx_progress_entries_daily_report_id ON public.progress_entries(daily_report_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity, entity_id);

-- Crear bucket de storage para fotos
INSERT INTO storage.buckets (id, name, public) VALUES ('progress-photos', 'progress-photos', true);

-- Políticas de storage para fotos de progreso
CREATE POLICY "Usuarios autenticados pueden subir fotos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'progress-photos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Todos pueden ver fotos de progreso" ON storage.objects
FOR SELECT USING (bucket_id = 'progress-photos');

CREATE POLICY "Usuarios pueden actualizar sus propias fotos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'progress-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuarios pueden eliminar sus propias fotos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'progress-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);