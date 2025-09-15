-- Corregir problemas de seguridad: Agregar search_path a todas las funciones

-- Función para obtener el rol del usuario actual (actualizada)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Función para actualizar timestamps (actualizada)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Función para crear perfil automáticamente (actualizada)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'reporter');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Función para actualizar progreso acumulado (actualizada)
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Función para manejar aprobación de reportes (actualizada)
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Función para logging de auditoría (actualizada)
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;