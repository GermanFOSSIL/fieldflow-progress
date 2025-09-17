// Datos mock para cuando no hay conexión con Supabase

export const mockProjects = [
  {
    id: 'demo-project-1',
    code: 'DEMO',
    name: 'Proyecto Demo - FieldProgress',
    description: 'Proyecto de demostración con datos de ejemplo para mostrar todas las funcionalidades del sistema',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockActivities = [
  {
    id: 'activity-1',
    project_id: 'demo-project-1',
    code: 'A-0001',
    name: 'Soldadura spool 2"',
    unit: 'u',
    boq_qty: 120,
    executed_qty: 78,
    progress_percentage: 65,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'activity-2',
    project_id: 'demo-project-1',
    code: 'A-0002',
    name: 'Soportes tubería',
    unit: 'm',
    boq_qty: 300,
    executed_qty: 195,
    progress_percentage: 65,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'activity-3',
    project_id: 'demo-project-1',
    code: 'A-0101',
    name: 'Tendido bandeja principal',
    unit: 'm',
    boq_qty: 200,
    executed_qty: 140,
    progress_percentage: 70,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'activity-4',
    project_id: 'demo-project-1',
    code: 'A-0120',
    name: 'Tendido cable 6mm2',
    unit: 'm',
    boq_qty: 1000,
    executed_qty: 650,
    progress_percentage: 65,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'activity-5',
    project_id: 'demo-project-1',
    code: 'A-0205',
    name: 'Instalación transmisores',
    unit: 'u',
    boq_qty: 40,
    executed_qty: 28,
    progress_percentage: 70,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'activity-6',
    project_id: 'demo-project-1',
    code: 'A-0003',
    name: 'Soldadura líneas de 6" Schedule 40',
    unit: 'jnt',
    boq_qty: 120,
    executed_qty: 78,
    progress_percentage: 65,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'activity-7',
    project_id: 'demo-project-1',
    code: 'A-0206',
    name: 'Instalación transmisores de presión',
    unit: 'u',
    boq_qty: 45,
    executed_qty: 28,
    progress_percentage: 62,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'activity-8',
    project_id: 'demo-project-1',
    code: 'A-0004',
    name: 'Instalación separador trifásico',
    unit: 'u',
    boq_qty: 2,
    executed_qty: 1,
    progress_percentage: 50,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'activity-9',
    project_id: 'demo-project-1',
    code: 'A-0121',
    name: 'Tendido cableado eléctrico 480V',
    unit: 'm',
    boq_qty: 500,
    executed_qty: 320,
    progress_percentage: 64,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'activity-10',
    project_id: 'demo-project-1',
    code: 'A-0207',
    name: 'Instalación válvulas de control',
    unit: 'u',
    boq_qty: 25,
    executed_qty: 18,
    progress_percentage: 72,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockProgressReports = [
  {
    id: 'report-1',
    project_id: 'demo-project-1',
    user_id: 'user-1',
    date: new Date().toISOString().split('T')[0],
    shift: 'morning',
    status: 'approved',
    total_activities: 3,
    total_progress: 12.5,
    notes: 'Trabajo normal, sin incidencias',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reporter: {
      id: 'user-1',
      email: 'demo@fieldprogress.com',
      full_name: 'Usuario Demo'
    }
  },
  {
    id: 'report-2',
    project_id: 'demo-project-1',
    user_id: 'user-1',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    shift: 'afternoon',
    status: 'approved',
    total_activities: 2,
    total_progress: 8.2,
    notes: 'Completado según plan',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reporter: {
      id: 'user-1',
      email: 'demo@fieldprogress.com',
      full_name: 'Usuario Demo'
    }
  },
  {
    id: 'report-3',
    project_id: 'demo-project-1',
    user_id: 'user-1',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    shift: 'morning',
    status: 'submitted',
    total_activities: 4,
    total_progress: 15.7,
    notes: 'Pendiente de aprobación',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    reporter: {
      id: 'user-1',
      email: 'demo@fieldprogress.com',
      full_name: 'Usuario Demo'
    }
  }
];

export const mockProgressEntries = [
  // Entradas del turno mañana
  {
    id: 'entry-1',
    activity_id: 'activity-1',
    project_id: 'demo-project-1',
    user_id: 'user-1',
    date: new Date().toISOString().split('T')[0],
    shift: 'morning',
    quantity: 5,
    comment: 'Progreso en soldadura spool 2"',
    photos: [],
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    activity: mockActivities[0]
  },
  {
    id: 'entry-2',
    activity_id: 'activity-2',
    project_id: 'demo-project-1',
    user_id: 'user-1',
    date: new Date().toISOString().split('T')[0],
    shift: 'morning',
    quantity: 8,
    comment: 'Instalación de soportes tubería',
    photos: [],
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    activity: mockActivities[1]
  },
  {
    id: 'entry-3',
    activity_id: 'activity-3',
    project_id: 'demo-project-1',
    user_id: 'user-1',
    date: new Date().toISOString().split('T')[0],
    shift: 'morning',
    quantity: 12,
    comment: 'Tendido bandeja principal completado',
    photos: [],
    status: 'submitted',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    activity: mockActivities[2]
  },
  // Entradas del turno tarde
  {
    id: 'entry-4',
    activity_id: 'activity-4',
    project_id: 'demo-project-1',
    user_id: 'user-2',
    date: new Date().toISOString().split('T')[0],
    shift: 'afternoon',
    quantity: 25,
    comment: 'Tendido cable 6mm2 - sección norte',
    photos: [],
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    activity: mockActivities[3]
  },
  {
    id: 'entry-5',
    activity_id: 'activity-5',
    project_id: 'demo-project-1',
    user_id: 'user-2',
    date: new Date().toISOString().split('T')[0],
    shift: 'afternoon',
    quantity: 3,
    comment: 'Instalación transmisores - área A',
    photos: [],
    status: 'submitted',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    activity: mockActivities[4]
  },
  {
    id: 'entry-6',
    activity_id: 'activity-6',
    project_id: 'demo-project-1',
    user_id: 'user-2',
    date: new Date().toISOString().split('T')[0],
    shift: 'afternoon',
    quantity: 4,
    comment: 'Soldadura líneas 6" Schedule 40',
    photos: [],
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    activity: mockActivities[5]
  },
  // Entradas del turno noche
  {
    id: 'entry-7',
    activity_id: 'activity-7',
    project_id: 'demo-project-1',
    user_id: 'user-3',
    date: new Date().toISOString().split('T')[0],
    shift: 'night',
    quantity: 2,
    comment: 'Instalación transmisores presión - turno nocturno',
    photos: [],
    status: 'submitted',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    activity: mockActivities[6]
  },
  {
    id: 'entry-8',
    activity_id: 'activity-8',
    project_id: 'demo-project-1',
    user_id: 'user-3',
    date: new Date().toISOString().split('T')[0],
    shift: 'night',
    quantity: 1,
    comment: 'Instalación separador trifásico',
    photos: [],
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    activity: mockActivities[7]
  },
  // Entradas adicionales para mostrar más progreso
  {
    id: 'entry-9',
    activity_id: 'activity-9',
    project_id: 'demo-project-1',
    user_id: 'user-1',
    date: new Date().toISOString().split('T')[0],
    shift: 'morning',
    quantity: 15,
    comment: 'Tendido cableado eléctrico 480V - fase 1',
    photos: [],
    status: 'submitted',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    activity: mockActivities[8]
  },
  {
    id: 'entry-10',
    activity_id: 'activity-10',
    project_id: 'demo-project-1',
    user_id: 'user-2',
    date: new Date().toISOString().split('T')[0],
    shift: 'afternoon',
    quantity: 2,
    comment: 'Instalación válvulas control - sistema principal',
    photos: [],
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    activity: mockActivities[9]
  }
];

// WhatsApp Mock Data
export const mockWhatsAppContacts = [
  {
    id: 'contact-1',
    name: 'Ana Silva',
    phone: '+56912345004',
    role: 'supervisor',
    project_id: 'demo-project-1',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'contact-2',
    name: 'Carlos Rodríguez',
    phone: '+56912345001',
    role: 'supervisor',
    project_id: 'demo-project-1',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'contact-3',
    name: 'María González',
    phone: '+56912345002',
    role: 'worker',
    project_id: 'demo-project-1',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'contact-4',
    name: 'Pedro Martínez',
    phone: '+56912345003',
    role: 'worker',
    project_id: 'demo-project-1',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockWhatsAppTemplates = [
  {
    id: 'template-1',
    name: 'Reporte de Avance Diario',
    content: '📊 *Reporte de Avance - {fecha}*\n\n🏗️ *Proyecto:* {proyecto}\n👷 *Supervisor:* {supervisor}\n\n📈 *Actividades Completadas:*\n{actividades}\n\n📝 *Observaciones:*\n{observaciones}\n\n✅ *Estado:* {estado}',
    variables: ['fecha', 'proyecto', 'supervisor', 'actividades', 'observaciones', 'estado'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'template-2',
    name: 'Solicitud de Liberación',
    content: '🔓 *Solicitud de Liberación*\n\n🏗️ *Proyecto:* {proyecto}\n📍 *Área:* {area}\n👷 *Solicitante:* {solicitante}\n\n📋 *Actividades a Liberar:*\n{actividades}\n\n📸 *Fotos adjuntas:* {fotos}\n\n⏰ *Fecha solicitada:* {fecha}',
    variables: ['proyecto', 'area', 'solicitante', 'actividades', 'fotos', 'fecha'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockWhatsAppConversations = [
  {
    id: 'conv-1',
    contact_id: 'contact-1',
    project_id: 'demo-project-1',
    last_message: 'Reporte enviado: Soldadura spool 2" - 5 unidades completadas',
    last_message_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    unread_count: 0,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'conv-2',
    contact_id: 'contact-2',
    project_id: 'demo-project-1',
    last_message: 'Solicitud de liberación para área A-01',
    last_message_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 horas atrás
    unread_count: 1,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'conv-3',
    contact_id: 'contact-3',
    project_id: 'demo-project-1',
    last_message: 'Personal en obra: 8 trabajadores, 2 supervisores',
    last_message_time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 horas atrás
    unread_count: 0,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockWhatsAppMessages = [
  {
    id: 'msg-1',
    conversation_id: 'conv-1',
    contact_id: 'contact-1',
    content: 'Buenos días, reporte de avance del día:\n\n✅ Soldadura spool 2" - 5 unidades\n✅ Soportes tubería - 12 metros\n✅ Inspección visual - Completada\n\nSin incidencias reportadas.',
    message_type: 'text',
    direction: 'inbound',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
    created_at: new Date().toISOString(),
  },
  {
    id: 'msg-2',
    conversation_id: 'conv-1',
    contact_id: 'contact-1',
    content: 'Reporte recibido y procesado. Excelente trabajo. 👍',
    message_type: 'text',
    direction: 'outbound',
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
    created_at: new Date().toISOString(),
  },
  {
    id: 'msg-3',
    conversation_id: 'conv-2',
    contact_id: 'contact-2',
    content: 'Solicito liberación para área A-01:\n\n📍 Área: A-01 - Soldadura\n👷 Supervisor: Carlos Rodríguez\n📋 Actividades completadas:\n- Soldadura spool 2" (100%)\n- Soportes tubería (100%)\n- Inspección visual (100%)\n\n📸 Fotos adjuntas en el sistema',
    message_type: 'text',
    direction: 'inbound',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
    created_at: new Date().toISOString(),
  },
  {
    id: 'msg-4',
    conversation_id: 'conv-3',
    contact_id: 'contact-3',
    content: 'Reporte de personal en obra:\n\n👷 *Trabajadores:* 8\n👨‍💼 *Supervisores:* 2\n⏰ *Hora de ingreso:* 06:00\n📍 *Ubicación:* Área A-01\n\nTodos presentes y trabajando según plan.',
    message_type: 'text',
    direction: 'inbound',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
    created_at: new Date().toISOString(),
  },
];

export const mockDashboardMetrics = {
  total_projects: 1,
  active_projects: 1,
  total_activities: 10,
  completed_activities: 3,
  total_progress: 650,
  pending_reports: 1,
  approved_reports: 2,
  team_members: 1
};
