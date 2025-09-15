-- Función para promover usuario a supervisor por email específico
CREATE OR REPLACE FUNCTION public.promote_developer_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Si el email es el del desarrollador, asignar rol supervisor
  IF NEW.email = 'dev@fieldprogress.com' THEN
    -- Actualizar el perfil que se creó automáticamente
    UPDATE public.profiles 
    SET role = 'supervisor' 
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para ejecutar después de que se cree un usuario
CREATE TRIGGER on_developer_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.promote_developer_user();

-- También crear una función manual para promover usuarios existentes
CREATE OR REPLACE FUNCTION public.make_user_supervisor(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Buscar el ID del usuario por email
  SELECT id INTO user_uuid 
  FROM auth.users 
  WHERE email = user_email 
  LIMIT 1;
  
  -- Si encontramos el usuario, actualizarlo a supervisor
  IF user_uuid IS NOT NULL THEN
    UPDATE public.profiles 
    SET role = 'supervisor' 
    WHERE id = user_uuid;
    
    -- Log de auditoría
    PERFORM public.log_audit('role_change', 'profiles', user_uuid, 
      json_build_object('new_role', 'supervisor', 'email', user_email));
  END IF;
END;
$$;