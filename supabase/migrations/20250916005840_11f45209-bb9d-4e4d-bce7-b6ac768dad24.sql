-- Phase 1: Fix Critical Infinite Recursion Issue
-- Create security definer function to safely get user role without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Los supervisores pueden ver todos los perfiles" ON public.users;

-- Create new non-recursive policy using the security definer function
CREATE POLICY "Los supervisores pueden ver todos los perfiles" 
ON public.users FOR SELECT 
USING (public.get_current_user_role() = 'supervisor');

-- Phase 2: Secure Business Data - Remove Public Access
-- Projects should only be visible to authenticated users
DROP POLICY IF EXISTS "Todos pueden ver proyectos" ON public.projects;
CREATE POLICY "Usuarios autenticados pueden ver proyectos" 
ON public.projects FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Work packages should only be visible to authenticated users  
DROP POLICY IF EXISTS "Todos pueden ver paquetes de trabajo" ON public.work_packages;
CREATE POLICY "Usuarios autenticados pueden ver paquetes de trabajo" 
ON public.work_packages FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Areas should only be visible to authenticated users
DROP POLICY IF EXISTS "Todos pueden ver áreas" ON public.areas;
CREATE POLICY "Usuarios autenticados pueden ver áreas" 
ON public.areas FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Systems should only be visible to authenticated users
DROP POLICY IF EXISTS "Todos pueden ver sistemas" ON public.systems;
CREATE POLICY "Usuarios autenticados pueden ver sistemas" 
ON public.systems FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Subsystems should only be visible to authenticated users
DROP POLICY IF EXISTS "Todos pueden ver subsistemas" ON public.subsystems;
CREATE POLICY "Usuarios autenticados pueden ver subsistemas" 
ON public.subsystems FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Activities should only be visible to authenticated users
DROP POLICY IF EXISTS "Todos pueden ver actividades" ON public.activities;
CREATE POLICY "Usuarios autenticados pueden ver actividades" 
ON public.activities FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Activity progress should only be visible to authenticated users
DROP POLICY IF EXISTS "Todos pueden ver progreso acumulado" ON public.activity_progress_agg;
CREATE POLICY "Usuarios autenticados pueden ver progreso acumulado" 
ON public.activity_progress_agg FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Daily closures should only be visible to authenticated users
DROP POLICY IF EXISTS "Todos pueden ver cierres diarios" ON public.daily_closures;
CREATE POLICY "Usuarios autenticados pueden ver cierres diarios" 
ON public.daily_closures FOR SELECT 
USING (auth.uid() IS NOT NULL);