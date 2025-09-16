import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Search, Plus, Edit, Trash2, Database, Users, MessageSquare, Activity } from 'lucide-react';
import { toast } from 'sonner';

const TABLES = [
  { name: 'projects', icon: Database, description: 'Proyectos principales' },
  { name: 'areas', icon: Database, description: 'Áreas de proyecto' },
  { name: 'systems', icon: Database, description: 'Sistemas' },
  { name: 'subsystems', icon: Database, description: 'Subsistemas' },
  { name: 'work_packages', icon: Database, description: 'Paquetes de trabajo' },
  { name: 'activities', icon: Activity, description: 'Actividades' },
  { name: 'progress_entries', icon: Activity, description: 'Entradas de progreso' },
  { name: 'daily_reports', icon: Activity, description: 'Reportes diarios' },
  { name: 'whatsapp_contacts', icon: Users, description: 'Contactos WhatsApp' },
  { name: 'whatsapp_conversations', icon: MessageSquare, description: 'Conversaciones WhatsApp' },
  { name: 'whatsapp_messages', icon: MessageSquare, description: 'Mensajes WhatsApp' },
  { name: 'whatsapp_templates', icon: MessageSquare, description: 'Plantillas WhatsApp' }
];

export default function DatabaseAdmin() {
  const [selectedTable, setSelectedTable] = useState('projects');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch table data
  const { data: tableData, isLoading } = useQuery({
    queryKey: ['table-data', selectedTable, searchTerm],
    queryFn: async () => {
      let query = supabase.from(selectedTable as any).select('*');
      
      // Apply basic search if term exists
      if (searchTerm) {
        // This is a simplified search - in real app you'd want more sophisticated filtering
        query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    }
  });

  // Export table data
  const exportTable = async () => {
    try {
      const { data, error } = await supabase
        .from(selectedTable as any)
        .select('*');
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast.error('No hay datos para exportar');
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${selectedTable}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success('Datos exportados exitosamente');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error al exportar datos');
    }
  };

  const currentTable = TABLES.find(t => t.name === selectedTable);
  const Icon = currentTable?.icon || Database;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administración de Base de Datos</h1>
          <p className="text-muted-foreground">
            Gestiona y visualiza los datos del sistema
          </p>
        </div>
      </div>

      <Tabs value={selectedTable} onValueChange={setSelectedTable} className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-6 w-full">
          {TABLES.map((table) => {
            const TableIcon = table.icon;
            return (
              <TabsTrigger 
                key={table.name} 
                value={table.name}
                className="flex items-center gap-2 text-xs"
              >
                <TableIcon className="h-3 w-3" />
                <span className="hidden sm:inline">{table.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TABLES.map((table) => (
          <TabsContent key={table.name} value={table.name}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <div>
                      <CardTitle className="capitalize">{table.name.replace('_', ' ')}</CardTitle>
                      <CardDescription>{table.description}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-48"
                      />
                    </div>
                    <Button onClick={exportTable} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground">Cargando datos...</div>
                  </div>
                ) : !tableData || tableData.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground">No hay datos disponibles</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {tableData.length} registro{tableData.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="border rounded-lg overflow-auto max-h-96">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {tableData[0] && Object.keys(tableData[0]).map((column) => (
                              <TableHead key={column} className="font-medium">
                                {column.replace('_', ' ').toUpperCase()}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableData.map((row, index) => (
                            <TableRow key={index}>
                              {Object.entries(row).map(([column, value]) => (
                                <TableCell key={column} className="max-w-48">
                                  {value === null || value === undefined ? (
                                    <span className="text-muted-foreground italic">null</span>
                                  ) : typeof value === 'object' ? (
                                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                      {JSON.stringify(value).slice(0, 50)}...
                                    </code>
                                  ) : typeof value === 'boolean' ? (
                                    <Badge variant={value ? 'default' : 'secondary'}>
                                      {value ? 'true' : 'false'}
                                    </Badge>
                                  ) : String(value).length > 50 ? (
                                    <span title={String(value)}>
                                      {String(value).slice(0, 50)}...
                                    </span>
                                  ) : (
                                    String(value)
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}