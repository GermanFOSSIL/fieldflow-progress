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

-- Reemplazar función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'reporter');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Actualizar trigger de timestamps
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

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