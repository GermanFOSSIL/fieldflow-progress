# FieldProgress - Sistema de Gestión de Construcción

FieldProgress es una aplicación web completa para la gestión de proyectos de construcción que integra reportes de avance, comunicación WhatsApp, análisis predictivo y aprobaciones en tiempo real.

## 🏗️ Arquitectura General

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components  
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Autenticación**: Supabase Auth
- **Comunicación**: WhatsApp API integration
- **Charts**: Recharts
- **Estado**: React Query + Context API

## 📱 Páginas y Funcionalidades

### 1. **Executive Dashboard** (`/dashboard`)
Vista ejecutiva con KPIs y métricas principales
- KPIs en tiempo real (avance, reportes, contactos)
- Gráficos de progreso vs planificado
- Alertas y notificaciones importantes

### 2. **WhatsApp** (`/whatsapp`)
Centro de comunicación con trabajadores
- **Conversaciones**: Chat en tiempo real
- **Templates**: Mensajes automatizados
- **Contactos**: Gestión y envío masivo

### 3. **Progress Capture** (`/capture`)
Captura de avances diarios por trabajadores
- Formulario de reportes con GPS
- Subida de fotos de progreso
- Selección de actividades y cantidades

### 4. **Approve** (`/approve`)
Aprobación de reportes por supervisores
- Lista de reportes pendientes
- Vista previa con fotos y detalles
- Aprobación/rechazo con comentarios

### 5. **AI Assistant** (`/ai-assistant`)
Asistente de IA para análisis de datos
- Chat interactivo con IA
- Consultas en lenguaje natural
- Análisis de progreso y riesgos

## 🗃️ Estructura de Base de Datos

### Tablas Principales
- **projects**: Información de proyectos
- **activities**: Actividades de construcción
- **daily_reports**: Reportes diarios de avance
- **progress_entries**: Entradas específicas de progreso
- **whatsapp_contacts**: Contactos WhatsApp
- **whatsapp_messages**: Mensajes de conversación
- **whatsapp_templates**: Templates de mensajes

## 🚀 Configuración y Desarrollo

### Instalación
```bash
npm install
npm run dev
```

### Variables de Entorno
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📚 Documentación Completa

- [🏗️ Arquitectura del Sistema](./docs/ARCHITECTURE.md)
- [🗃️ Esquema de Base de Datos](./docs/DATABASE.md)
- [📊 Executive Dashboard](./docs/pages/EXECUTIVE_DASHBOARD.md)
- [📱 WhatsApp](./docs/pages/WHATSAPP_BUSINESS.md)
- [📋 Progress Capture](./docs/pages/PROGRESS_CAPTURE.md)

## 🔒 Seguridad

- **RLS**: Todas las tablas protegidas con Row Level Security
- **Authentication**: JWT tokens con Supabase Auth
- **Input Validation**: Validación client-side y server-side

---

**Versión**: 1.0.0  
**Mantenido por**: Equipo de Desarrollo FieldProgress