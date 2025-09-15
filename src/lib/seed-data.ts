import { supabase } from '@/integrations/supabase/client';

export async function insertSeedData() {
  try {
    // 1. Insertar proyecto
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .upsert({
        code: 'FP01',
        name: 'FieldProgress Demo',
        status: 'active'
      })
      .select()
      .single();

    if (projectError) throw projectError;
    console.log('Proyecto creado:', project);

    // 2. Insertar áreas
    const { data: area1, error: areaError } = await supabase
      .from('areas')
      .upsert({
        project_id: project.id,
        code: 'AR1',
        name: 'Área 1'
      })
      .select()
      .single();

    if (areaError) throw areaError;

    const { data: area2, error: area2Error } = await supabase
      .from('areas')
      .upsert({
        project_id: project.id,
        code: 'AR2',
        name: 'Área 2'
      })
      .select()
      .single();

    if (area2Error) throw area2Error;

    // 3. Insertar sistemas
    const { data: system1, error: system1Error } = await supabase
      .from('systems')
      .upsert({
        area_id: area1.id,
        code: 'SYS-101',
        name: 'Sistema Proceso'
      })
      .select()
      .single();

    if (system1Error) throw system1Error;

    const { data: system2, error: system2Error } = await supabase
      .from('systems')
      .upsert({
        area_id: area1.id,
        code: 'SYS-200',
        name: 'Sistema Eléctrico'
      })
      .select()
      .single();

    if (system2Error) throw system2Error;

    const { data: system3, error: system3Error } = await supabase
      .from('systems')
      .upsert({
        area_id: area2.id,
        code: 'SYS-300',
        name: 'Sistema Instrumentos'
      })
      .select()
      .single();

    if (system3Error) throw system3Error;

    // 4. Insertar subsistemas
    const { data: subsystem1, error: subsystem1Error } = await supabase
      .from('subsystems')
      .upsert({
        system_id: system1.id,
        code: 'SUB-101P',
        name: 'Sub HCN'
      })
      .select()
      .single();

    if (subsystem1Error) throw subsystem1Error;

    const { data: subsystem2, error: subsystem2Error } = await supabase
      .from('subsystems')
      .upsert({
        system_id: system2.id,
        code: 'SUB-101EL',
        name: 'Sub Eléctrico'
      })
      .select()
      .single();

    if (subsystem2Error) throw subsystem2Error;

    const { data: subsystem3, error: subsystem3Error } = await supabase
      .from('subsystems')
      .upsert({
        system_id: system3.id,
        code: 'SUB-101I',
        name: 'Sub Instrumentos'
      })
      .select()
      .single();

    if (subsystem3Error) throw subsystem3Error;

    // 5. Insertar paquetes de trabajo
    const workPackages = [
      { subsystem_id: subsystem1.id, code: 'WP-001', name: 'Piping Rack', contractor: 'PECOM' },
      { subsystem_id: subsystem2.id, code: 'WP-010', name: 'Bandejas', contractor: 'HYTECH' },
      { subsystem_id: subsystem2.id, code: 'WP-012', name: 'Cableado', contractor: 'HYTECH' },
      { subsystem_id: subsystem3.id, code: 'WP-020', name: 'Instrumentación', contractor: 'TM&C' }
    ];

    const { data: wps, error: wpError } = await supabase
      .from('work_packages')
      .upsert(workPackages)
      .select();

    if (wpError) throw wpError;

    // 6. Insertar actividades
    const activities = [
      {
        work_package_id: wps.find(wp => wp.code === 'WP-001')?.id,
        code: 'A-0001',
        name: 'Soldadura spool 2"',
        unit: 'u',
        boq_qty: 120,
        weight: 0.20
      },
      {
        work_package_id: wps.find(wp => wp.code === 'WP-001')?.id,
        code: 'A-0002',
        name: 'Soportes tubería',
        unit: 'm',
        boq_qty: 300,
        weight: 0.15
      },
      {
        work_package_id: wps.find(wp => wp.code === 'WP-010')?.id,
        code: 'A-0101',
        name: 'Tendido bandeja principal',
        unit: 'm',
        boq_qty: 200,
        weight: 0.25
      },
      {
        work_package_id: wps.find(wp => wp.code === 'WP-012')?.id,
        code: 'A-0120',
        name: 'Tendido cable 6mm2',
        unit: 'm',
        boq_qty: 1000,
        weight: 0.25
      },
      {
        work_package_id: wps.find(wp => wp.code === 'WP-020')?.id,
        code: 'A-0205',
        name: 'Instalación transmisores',
        unit: 'u',
        boq_qty: 40,
        weight: 0.15
      }
    ];

    const { error: activitiesError } = await supabase
      .from('activities')
      .upsert(activities);

    if (activitiesError) throw activitiesError;

    console.log('Datos de prueba insertados correctamente');
    return { success: true };

  } catch (error) {
    console.error('Error insertando datos de prueba:', error);
    return { success: false, error };
  }
}