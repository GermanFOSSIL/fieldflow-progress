-- Crear tabla de usuarios con roles
CREATE TABLE public.users (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'reporter' CHECK (role IN ('reporter', 'supervisor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en la tabla users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver su propio perfil
CREATE POLICY "Los usuarios pueden ver su propio perfil" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- Política: Los usuarios pueden actualizar su propio perfil (excepto role)
CREATE POLICY "Los usuarios pueden actualizar su perfil" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política: Los supervisores pueden ver todos los perfiles
CREATE POLICY "Los supervisores pueden ver todos los perfiles" 
ON public.users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'supervisor'
  )
);

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'reporter');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Actualizar trigger de timestamps
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Actualizar políticas RLS existentes para usar roles

-- Actualizar daily_reports policies
DROP POLICY IF EXISTS "Los reporteros pueden crear sus propios reportes" ON public.daily_reports;
DROP POLICY IF EXISTS "Los reporteros pueden ver sus propios reportes" ON public.daily_reports;
DROP POLICY IF EXISTS "Los reporteros pueden actualizar sus reportes draft/sent" ON public.daily_reports;
DROP POLICY IF EXISTS "Los supervisores pueden ver todos los reportes" ON public.daily_reports;
DROP POLICY IF EXISTS "Los supervisores pueden aprobar reportes" ON public.daily_reports;

CREATE POLICY "Los reporteros pueden crear sus propios reportes" 
ON public.daily_reports 
FOR INSERT 
WITH CHECK (
  auth.uid() = reporter_id AND 
  public.get_current_user_role() IN ('reporter', 'supervisor')
);

CREATE POLICY "Los usuarios pueden ver reportes según su rol" 
ON public.daily_reports 
FOR SELECT 
USING (
  CASE public.get_current_user_role()
    WHEN 'reporter' THEN auth.uid() = reporter_id
    WHEN 'supervisor' THEN true
    WHEN 'viewer' THEN status = 'approved'
    ELSE false
  END
);

CREATE POLICY "Los reporteros pueden actualizar sus reportes no aprobados" 
ON public.daily_reports 
FOR UPDATE 
USING (
  auth.uid() = reporter_id AND 
  status IN ('draft', 'sent') AND
  public.get_current_user_role() = 'reporter'
);

CREATE POLICY "Los supervisores pueden aprobar reportes" 
ON public.daily_reports 
FOR UPDATE 
USING (public.get_current_user_role() = 'supervisor');

-- Actualizar progress_entries policies
DROP POLICY IF EXISTS "Los reporteros pueden crear entradas de progreso" ON public.progress_entries;
DROP POLICY IF EXISTS "Los usuarios pueden ver entradas de progreso de sus reportes" ON public.progress_entries;
DROP POLICY IF EXISTS "Los reporteros pueden actualizar entradas de reportes no aproba" ON public.progress_entries;
DROP POLICY IF EXISTS "Los supervisores pueden ver todas las entradas de progreso" ON public.progress_entries;
DROP POLICY IF EXISTS "Los supervisores pueden actualizar entradas de progreso" ON public.progress_entries;

CREATE POLICY "Los reporteros pueden crear entradas de progreso" 
ON public.progress_entries 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.daily_reports dr
    WHERE dr.id = progress_entries.daily_report_id 
    AND dr.reporter_id = auth.uid()
    AND public.get_current_user_role() IN ('reporter', 'supervisor')
  )
);

CREATE POLICY "Los usuarios pueden ver entradas según su rol" 
ON public.progress_entries 
FOR SELECT 
USING (
  CASE public.get_current_user_role()
    WHEN 'reporter' THEN EXISTS (
      SELECT 1 FROM public.daily_reports dr
      WHERE dr.id = progress_entries.daily_report_id 
      AND dr.reporter_id = auth.uid()
    )
    WHEN 'supervisor' THEN true
    WHEN 'viewer' THEN EXISTS (
      SELECT 1 FROM public.daily_reports dr
      WHERE dr.id = progress_entries.daily_report_id 
      AND dr.status = 'approved'
    )
    ELSE false
  END
);

CREATE POLICY "Los reporteros pueden actualizar sus entradas no aprobadas" 
ON public.progress_entries 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.daily_reports dr
    WHERE dr.id = progress_entries.daily_report_id 
    AND dr.reporter_id = auth.uid()
    AND dr.status != 'approved'
    AND public.get_current_user_role() = 'reporter'
  )
);

CREATE POLICY "Los supervisores pueden actualizar entradas de progreso" 
ON public.progress_entries 
FOR UPDATE 
USING (public.get_current_user_role() = 'supervisor');

-- Actualizar daily_closures policies
DROP POLICY IF EXISTS "Solo supervisores pueden crear cierres diarios" ON public.daily_closures;

CREATE POLICY "Solo supervisores pueden crear cierres diarios" 
ON public.daily_closures 
FOR INSERT 
WITH CHECK (public.get_current_user_role() = 'supervisor');

-- Actualizar audit_logs policies
DROP POLICY IF EXISTS "Los supervisores pueden ver logs de auditoría" ON public.audit_logs;

CREATE POLICY "Los supervisores pueden ver logs de auditoría" 
ON public.audit_logs 
FOR SELECT 
USING (public.get_current_user_role() IN ('supervisor', 'viewer'));

-- Función para hacer supervisor a un usuario por email
CREATE OR REPLACE FUNCTION public.make_user_supervisor(user_email TEXT)
RETURNS VOID AS $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Buscar el ID del usuario por email
  SELECT id INTO user_uuid 
  FROM auth.users 
  WHERE email = user_email 
  LIMIT 1;
  
  -- Si encontramos el usuario, actualizarlo a supervisor
  IF user_uuid IS NOT NULL THEN
    UPDATE public.users 
    SET role = 'supervisor' 
    WHERE id = user_uuid;
    
    -- Log de auditoría
    PERFORM public.log_audit('role_change', 'users', user_uuid, 
      json_build_object('new_role', 'supervisor', 'email', user_email));
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;