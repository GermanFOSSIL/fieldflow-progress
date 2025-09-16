# Executive Dashboard - Documentación

## 📊 Propósito y Funcionalidad

El **Executive Dashboard** (`/dashboard`) es la página principal para supervisores y gerentes, proporcionando una vista ejecutiva en tiempo real del estado del proyecto con KPIs, gráficos interactivos y alertas importantes.

## 🎯 Características Principales

### 1. **KPIs en Tiempo Real**
- Avance General del Proyecto
- Reportes Pendientes de Aprobación  
- Total de Actividades
- Contactos WhatsApp Activos

### 2. **Visualizaciones Interactivas**
- Gráfico de Avance vs Planificado
- Distribución de Actividades por Especialidad
- Progreso Detallado por Actividad
- Estadísticas de Reportes

### 3. **Sistema de Alertas**
- Alertas de retrasos críticos
- Notificaciones de reportes pendientes
- Logros y hitos completados

## 💻 Implementación Técnica

### Estructura del Componente
```typescript
// src/pages/ExecutiveDashboard.tsx
import { useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function ExecutiveDashboard() {
  const { selectedProject } = useProject();
  
  // Fetch real-time project statistics
  const { data: projectStats } = useQuery({
    queryKey: ['project-stats', selectedProject?.id],
    queryFn: async () => {
      // Fetch data from multiple tables
      const [activities, reports, progress, contacts] = await Promise.all([
        supabase.from('activities').select('*'),
        supabase.from('daily_reports').select('*').eq('project_id', selectedProject.id),
        supabase.from('activity_progress_agg').select('*'),
        supabase.from('whatsapp_contacts').select('*').eq('is_active', true)
      ]);
      
      return {
        totalActivities: activities?.length || 0,
        totalReports: reports?.length || 0,
        pendingReports: reports?.filter(r => r.status === 'sent').length || 0,
        averageProgress: calculateAverageProgress(progress?.data),
        activeContacts: contacts?.length || 0
      };
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    enabled: !!selectedProject?.id
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <KPISection kpis={kpis} />
      
      {/* Interactive Charts */}
      <ChartsSection data={projectStats} />
      
      {/* Alerts and Notifications */}
      <AlertsSection />
    </div>
  );
}
```

### KPI Cards Component
```typescript
const KPICard = ({ title, value, change, trend, icon: Icon, color, bgColor }) => (
  <Card className="relative overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <div className="flex items-center mt-1">
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
            )}
            <span className={`text-sm ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}>
              {change}
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);
```

### Gráficos con Recharts
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ProgressChart = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle>Avance vs Planificado</CardTitle>
      <CardDescription>
        Comparación mensual del avance real vs planificado
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="planned" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            name="Planificado"
          />
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="hsl(var(--secondary))" 
            strokeWidth={2}
            name="Real"
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);
```

## 🔄 Flujo de Datos

### 1. **Inicialización**
```typescript
// Cuando el componente se monta
useEffect(() => {
  if (selectedProject?.id) {
    // Inicia queries en paralelo
    fetchProjectStats();
    setupRealTimeSubscriptions();
  }
}, [selectedProject?.id]);
```

### 2. **Actualización en Tiempo Real**
```typescript
// Configuración de suscripciones Supabase
useEffect(() => {
  const channel = supabase
    .channel('dashboard-updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'daily_reports'
    }, (payload) => {
      // Actualizar KPIs cuando hay cambios en reportes
      queryClient.invalidateQueries(['project-stats']);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### 3. **Cálculo de Métricas**
```typescript
const calculateProjectStats = (activities, reports, progress) => {
  return {
    totalActivities: activities?.length || 0,
    totalReports: reports?.length || 0,
    pendingReports: reports?.filter(r => r.status === 'sent').length || 0,
    approvedReports: reports?.filter(r => r.status === 'approved').length || 0,
    averageProgress: progress?.reduce((acc, p) => acc + (p.pct || 0), 0) / (progress?.length || 1) * 100,
    completedActivities: progress?.filter(p => p.pct >= 1).length || 0
  };
};
```

## 📊 Estructura de Datos

### KPIs Data Structure
```typescript
interface ProjectKPIs {
  totalActivities: number;
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  averageProgress: number;
  activeContacts: number;
  completedActivities: number;
}
```

### Chart Data Structures
```typescript
// Progress Chart Data
interface ProgressDataPoint {
  name: string;
  planned: number;
  actual: number;
}

// Activities Distribution
interface ActivityDistribution {
  name: string;
  value: number;
  color: string;
}

// Daily Reports Activity
interface ReportActivity {
  date: string;
  reports: number;
  approved: number;
  pending: number;
}
```

## 🎨 Componentes UI

### Tabs Navigation
```typescript
<Tabs defaultValue="overview" className="space-y-6">
  <TabsList>
    <TabsTrigger value="overview">Vista General</TabsTrigger>
    <TabsTrigger value="progress">Avance de Obra</TabsTrigger>
    <TabsTrigger value="reports">Reportes</TabsTrigger>
  </TabsList>
  
  <TabsContent value="overview">
    <OverviewCharts />
  </TabsContent>
  
  <TabsContent value="progress">
    <ProgressDetails />
  </TabsContent>
  
  <TabsContent value="reports">
    <ReportsAnalytics />
  </TabsContent>
</Tabs>
```

### Alert System
```typescript
const AlertCard = ({ type, title, description, priority }) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg border ${
    type === 'error' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
  }`}>
    <AlertTriangle className={`h-4 w-4 ${
      type === 'error' ? 'text-red-500' : 'text-orange-500'
    }`} />
    <div className="flex-grow">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <Badge variant={priority === 'high' ? 'destructive' : 'secondary'}>
      {priority}
    </Badge>
  </div>
);
```

## 🔍 Queries y Performance

### Optimización de Queries
```typescript
// Query optimization with specific selects
const { data: activities } = useQuery({
  queryKey: ['activities', selectedProject?.id],
  queryFn: () => supabase
    .from('activities')
    .select('id, name, boq_qty, weight')
    .limit(1000),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000 // 10 minutes
});
```

### Parallel Data Fetching
```typescript
const useProjectDashboardData = (projectId) => {
  return useQueries({
    queries: [
      {
        queryKey: ['activities', projectId],
        queryFn: () => fetchActivities(projectId)
      },
      {
        queryKey: ['reports', projectId],
        queryFn: () => fetchReports(projectId)
      },
      {
        queryKey: ['progress', projectId],
        queryFn: () => fetchProgress(projectId)
      }
    ]
  });
};
```

## 🎯 Estados y Loading

### Loading States
```typescript
if (isLoadingStats) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Cargando métricas...</p>
      </div>
    </div>
  );
}
```

### Empty States
```typescript
if (!selectedProject) {
  return (
    <div className="h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">Selecciona un proyecto</h3>
        <p className="text-muted-foreground">
          Elige un proyecto para ver el dashboard ejecutivo
        </p>
      </div>
    </div>
  );
}
```

## 🚀 Funcionalidades Futuras

### Real-time Updates
- WebSocket connections para updates instantáneos
- Push notifications para alertas críticas
- Live collaboration indicators

### Advanced Analytics
- Machine learning predictions
- Trend analysis
- Resource optimization suggestions

### Export Capabilities
- PDF report generation
- Excel exports
- Scheduled reports

---
**Documentado por**: Equipo de Frontend  
**Última actualización**: Enero 2025