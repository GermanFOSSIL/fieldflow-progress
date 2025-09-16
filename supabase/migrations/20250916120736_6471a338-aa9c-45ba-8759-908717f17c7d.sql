-- Create WhatsApp related tables first
CREATE TABLE public.whatsapp_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'worker',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.whatsapp_contacts(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'bot')),
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'location', 'template_response')),
  template_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('menu', 'survey', 'progress_form', 'alert_form')),
  content JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view WhatsApp contacts" ON public.whatsapp_contacts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Supervisors can manage WhatsApp contacts" ON public.whatsapp_contacts FOR ALL USING (get_user_role() = 'supervisor');

CREATE POLICY "Authenticated users can view conversations" ON public.whatsapp_conversations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Supervisors can manage conversations" ON public.whatsapp_conversations FOR ALL USING (get_user_role() = 'supervisor');

CREATE POLICY "Authenticated users can view messages" ON public.whatsapp_messages FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "System can insert messages" ON public.whatsapp_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Supervisors can manage messages" ON public.whatsapp_messages FOR ALL USING (get_user_role() = 'supervisor');

CREATE POLICY "Authenticated users can view templates" ON public.whatsapp_templates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Supervisors can manage templates" ON public.whatsapp_templates FOR ALL USING (get_user_role() = 'supervisor');

-- Insert sample data
-- First, populate the main project structure
INSERT INTO public.projects (id, code, name, status) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'PRJ-001', 'Construcción Planta Industrial Fase 1', 'active'),
('550e8400-e29b-41d4-a716-446655440001', 'PRJ-002', 'Ampliación Refinería Norte', 'active');

INSERT INTO public.areas (id, project_id, code, name) VALUES 
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'AR-100', 'Área de Proceso'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'AR-200', 'Área Eléctrica'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'AR-300', 'Área Instrumentación');

INSERT INTO public.systems (id, area_id, code, name) VALUES 
('770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'SYS-101', 'Sistema Piping Principal'),
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'SYS-201', 'Sistema Distribución Eléctrica'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'SYS-301', 'Sistema Control Procesos');

INSERT INTO public.subsystems (id, system_id, code, name) VALUES 
('880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'SUB-101A', 'Tuberías Principales'),
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'SUB-201A', 'Bandejas Eléctricas'),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'SUB-301A', 'Instrumentos Campo');

INSERT INTO public.work_packages (id, subsystem_id, code, name, contractor) VALUES 
('990e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440000', 'WP-001', 'Instalación Piping Rack A', 'CONTRACTOR-A'),
('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'WP-002', 'Montaje Bandejas Zona 1', 'CONTRACTOR-B'),
('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 'WP-003', 'Instalación Instrumentos PT', 'CONTRACTOR-C');

-- Insert activities with realistic S-curve progression
INSERT INTO public.activities (id, work_package_id, code, name, unit, boq_qty, weight) VALUES 
('aa0e8400-e29b-41d4-a716-446655440000', '990e8400-e29b-41d4-a716-446655440000', 'ACT-001', 'Soldadura Spools 2"', 'u', 150, 0.25),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440000', 'ACT-002', 'Instalación Soportes', 'u', 80, 0.15),
('aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440001', 'ACT-003', 'Tendido Bandejas', 'm', 500, 0.30),
('aa0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440001', 'ACT-004', 'Cableado Principal', 'm', 1200, 0.20),
('aa0e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440002', 'ACT-005', 'Instalación Transmisores', 'u', 45, 0.10);

-- Insert WhatsApp sample data
INSERT INTO public.whatsapp_contacts (id, phone, name, role, is_active) VALUES 
('bb0e8400-e29b-41d4-a716-446655440000', '+56912345001', 'Carlos Rodríguez', 'supervisor', true),
('bb0e8400-e29b-41d4-a716-446655440001', '+56912345002', 'María González', 'worker', true),
('bb0e8400-e29b-41d4-a716-446655440002', '+56912345003', 'Pedro Martínez', 'worker', true),
('bb0e8400-e29b-41d4-a716-446655440003', '+56912345004', 'Ana Silva', 'supervisor', true);

INSERT INTO public.whatsapp_conversations (id, contact_id, project_id, title, is_active) VALUES 
('cc0e8400-e29b-41d4-a716-446655440000', 'bb0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Avances Área Proceso', true),
('cc0e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Reportes Soldadura', true),
('cc0e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Instalación Instrumentos', true);

-- Insert sample templates
INSERT INTO public.whatsapp_templates (id, name, template_type, content, is_active) VALUES 
('dd0e8400-e29b-41d4-a716-446655440000', 'Reporte de Avance Diario', 'progress_form', 
'{"title": "Reporte de Avance", "fields": [{"name": "activity", "type": "select", "options": ["Soldadura", "Montaje", "Instalación"]}, {"name": "quantity", "type": "number", "label": "Cantidad realizada"}, {"name": "issues", "type": "text", "label": "Problemas encontrados"}]}', true),
('dd0e8400-e29b-41d4-a716-446655440001', 'Menú Principal', 'menu', 
'{"title": "¿Qué deseas hacer?", "options": [{"id": "1", "text": "Reportar avance"}, {"id": "2", "text": "Consultar inventario"}, {"id": "3", "text": "Reportar problema"}, {"id": "4", "text": "Ver clima"}]}', true);

-- Create triggers for updated_at
CREATE TRIGGER update_whatsapp_contacts_updated_at
  BEFORE UPDATE ON public.whatsapp_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_conversations_updated_at
  BEFORE UPDATE ON public.whatsapp_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_templates_updated_at
  BEFORE UPDATE ON public.whatsapp_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();