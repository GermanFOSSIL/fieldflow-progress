# WhatsApp - Documentación

## 📱 Propósito y Funcionalidad

El módulo **WhatsApp** (`/whatsapp`) es el centro de comunicación de la aplicación, permitiendo gestionar conversaciones con trabajadores, enviar templates automatizados y administrar contactos para comunicación masiva.

## 🎯 Características Principales

### 1. **Gestión de Conversaciones**
- Chat en tiempo real con trabajadores de campo
- Historial completo de mensajes
- Estados de entrega y lectura
- Integración con reportes de progreso

### 2. **Sistema de Templates**
- Templates predefinidos para diferentes propósitos
- Envío individual y masivo
- Personalización de contenido
- Vista previa en tiempo real

### 3. **Administración de Contactos**
- Lista completa de trabajadores
- Selección múltiple para envío masivo
- Filtros por rol y proyecto
- Estados de conexión en tiempo real

## 💻 Implementación Técnica

### Estructura Principal del Componente
```typescript
// src/pages/WhatsAppBusiness.tsx
import { useState } from \"react\";
import { Tabs, TabsContent, TabsList, TabsTrigger } from \"@/components/ui/tabs\";
import { useWhatsAppPersistence } from \"@/hooks/useWhatsAppPersistence\";
import { useWhatsAppTemplates } from \"@/hooks/useWhatsAppTemplates\";

export default function WhatsAppBusiness() {
  const { selectedProject } = useProject();
  
  // WhatsApp data hooks
  const { 
    contacts, 
    conversations, 
    saveMessage, 
    createConversation,
    fetchMessages 
  } = useWhatsAppPersistence();
  
  // Templates management
  const { templates, generateMenuResponse } = useWhatsAppTemplates();
  
  // Local state
  const [activeTab, setActiveTab] = useState(\"conversations\");
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [messages, setMessages] = useState([]);

  return (
    <div className=\"h-[calc(100vh-8rem)]\">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className=\"grid w-auto grid-cols-3\">
          <TabsTrigger value=\"conversations\">Conversaciones</TabsTrigger>
          <TabsTrigger value=\"templates\">Templates</TabsTrigger>
          <TabsTrigger value=\"contacts\">Contactos</TabsTrigger>
        </TabsList>
        
        <TabsContent value=\"conversations\">
          <ConversationsTab />
        </TabsContent>
        <TabsContent value=\"templates\">
          <TemplatesTab />
        </TabsContent>
        <TabsContent value=\"contacts\">
          <ContactsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Hook de Persistencia WhatsApp
```typescript
// src/hooks/useWhatsAppPersistence.ts
export function useWhatsAppPersistence() {
  const queryClient = useQueryClient();

  // Fetch contacts
  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: ['whatsapp-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_contacts')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Save message mutation
  const saveMessageMutation = useMutation({
    mutationFn: async ({ 
      conversationId, 
      senderType, 
      messageText, 
      messageType = 'text',
      templateData 
    }) => {
      const { error } = await supabase
        .from('whatsapp_messages')
        .insert({
          conversation_id: conversationId,
          sender_type: senderType,
          message_text: messageText,
          message_type: messageType,
          template_data: templateData
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages'] });
    }
  });

  return {
    contacts,
    contactsLoading,
    saveMessage: saveMessageMutation.mutate,
    // ... other functions
  };
}
```

## 📱 Pestaña de Conversaciones

### Layout de Dos Paneles
```typescript
const ConversationsTab = () => (
  <div className=\"h-full flex\">
    {/* Contacts Sidebar */}
    <div className=\"w-1/3 border-r bg-muted/30\">
      <ContactsSidebar />
    </div>
    
    {/* Chat Area */}
    <div className=\"flex-1 flex flex-col\">
      {selectedContact ? (
        <>
          <ChatHeader contact={selectedContact} />
          <MessagesArea messages={messages} />
          <MessageInput onSend={handleSendMessage} />
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  </div>
);
```

### Componente de Mensajes
```typescript
const MessageBubble = ({ message, isOwn }) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[70%] rounded-lg p-3 ${
      isOwn 
        ? 'bg-primary text-primary-foreground' 
        : 'bg-background border'
    }`}>
      {message.type === 'template' ? (
        <TemplateMessage template={message.templateData} />
      ) : (
        <p className=\"text-sm\">{message.text}</p>
      )}
      
      <div className=\"flex items-center justify-between mt-2\">
        <span className=\"text-xs opacity-70\">{message.timestamp}</span>
        {isOwn && <MessageStatus status={message.status} />}
      </div>
    </div>
  </div>
);
```

### Envío de Mensajes
```typescript
const handleSendMessage = async () => {
  if (!newMessage.trim() || !selectedContact) return;

  const message = {
    id: Date.now().toString(),
    sender: 'supervisor',
    text: newMessage,
    timestamp: new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    type: 'text',
    status: 'sent'
  };

  // Optimistic update
  setMessages(prev => [...prev, message]);
  setNewMessage('');

  try {
    // Persist to database
    saveMessage({
      conversationId: selectedContact.id,
      senderType: 'bot',
      messageText: newMessage,
      messageType: 'text'
    });
  } catch (error) {
    console.error('Error saving message:', error);
    // Handle error (rollback optimistic update)
  }
};
```

## 📄 Pestaña de Templates

### Gestión de Templates
```typescript
const TemplatesTab = () => {
  const { templates, isLoading } = useWhatsAppTemplates();
  
  return (
    <div className=\"space-y-6 p-6\">
      <div className=\"flex items-center justify-between\">
        <div>
          <h3 className=\"text-lg font-semibold\">Templates WhatsApp</h3>
          <p className=\"text-muted-foreground\">Gestiona templates para envío automático</p>
        </div>
        <Button asChild>
          <a href=\"/whatsapp-templates\">
            <Settings className=\"h-4 w-4 mr-2\" />
            Administrar Templates
          </a>
        </Button>
      </div>

      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
};
```

### Hook de Templates
```typescript
// src/hooks/useWhatsAppTemplates.ts
export function useWhatsAppTemplates() {
  const { data: templates, isLoading } = useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const generateMenuResponse = (template) => {
    const { title, options } = template.content;
    let response = `📋 ${title}\n\n`;
    
    options.forEach((option, index) => {
      response += `${index + 1}. ${option.label}\n`;
    });
    
    response += "\nResponde con el número de tu elección.";
    return response;
  };

  const generateFormResponse = (template) => {
    const { title, fields } = template.content;
    let response = `📝 ${title}\n\n`;
    
    fields.forEach((field) => {
      response += `• ${field.label}`;
      if (field.required) response += " (requerido)\";
      response += "\n";
    });
    
    return response;
  };

  return {
    templates,
    isLoading,
    generateMenuResponse,
    generateFormResponse
  };
}
```

## 👥 Pestaña de Contactos

### Gestión de Contactos Masiva
```typescript
const ContactsTab = () => {
  const [selectedContacts, setSelectedContacts] = useState([]);
  
  const handleContactCheckbox = (contactId, checked) => {
    if (checked) {
      setSelectedContacts(prev => [...prev, contactId]);
    } else {
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedContacts(contacts?.map(c => c.id) || []);
    } else {
      setSelectedContacts([]);
    }
  };

  return (
    <div className=\"space-y-6 p-6\">
      <div className=\"flex items-center justify-between\">
        <h3 className=\"text-lg font-semibold\">Gestión de Contactos</h3>
        {selectedContacts.length > 0 && (
          <Button onClick={() => setIsTemplateDialogOpen(true)}>
            <MessageCircleCode className=\"h-4 w-4 mr-2\" />
            Enviar Template ({selectedContacts.length})
          </Button>
        )}
      </div>

      <div className=\"space-y-4\">
        <SelectAllCheckbox 
          checked={selectedContacts.length === contacts?.length}
          onCheckedChange={handleSelectAll}
        />
        
        <div className=\"grid gap-4\">
          {contacts?.map((contact) => (
            <ContactCard 
              key={contact.id}
              contact={contact}
              selected={selectedContacts.includes(contact.id)}
              onCheckboxChange={handleContactCheckbox}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
```

## 📤 Sistema de Envío de Templates

### Dialog de Selección de Template
```typescript
const TemplateSelectionDialog = ({ 
  isOpen, 
  onClose, 
  selectedContacts, 
  onSendTemplate 
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className=\"max-w-md\">
      <DialogHeader>
        <DialogTitle>Envío Masivo de Template</DialogTitle>
        <DialogDescription>
          Enviar template a {selectedContacts.length} contacto(s) seleccionado(s)
        </DialogDescription>
      </DialogHeader>
      
      <div className=\"space-y-4\">
        <Select onValueChange={setSelectedTemplate}>
          <SelectTrigger>
            <SelectValue placeholder=\"Selecciona un template\" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                <div className=\"flex items-center gap-2\">
                  <Badge variant=\"secondary\">{template.template_type}</Badge>
                  {template.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedTemplate && (
          <div className=\"p-3 bg-muted rounded-lg\">
            <h4 className=\"font-medium mb-2\">Vista previa:</h4>
            <p className=\"text-sm\">{selectedTemplate.content.title}</p>
          </div>
        )}
      </div>
      
      <DialogFooter>
        <Button variant=\"outline\" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={() => onSendTemplate(selectedTemplate.id)}>
          Enviar a {selectedContacts.length} contacto(s)
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
```

### Lógica de Envío Masivo
```typescript
const handleSendTemplate = async (templateId) => {
  if (!selectedContacts.length) {
    toast({
      title: \"Error\",
      description: \"Selecciona al menos un contacto\",
      variant: \"destructive\"
    });
    return;
  }

  const template = templates.find(t => t.id === templateId);
  if (!template) return;

  // Generate template content based on type
  let templateMessage = \"\";
  if (template.template_type === 'menu') {
    templateMessage = generateMenuResponse(template);
  } else if (template.template_type === 'progress_form') {
    templateMessage = generateFormResponse(template);
  } else {
    templateMessage = template.content.title || \"Template message\";
  }

  try {
    // Send to all selected contacts
    const promises = selectedContacts.map(contactId => 
      saveMessage({
        conversationId: contactId,
        senderType: 'bot',
        messageText: templateMessage,
        messageType: 'template',
        templateData: { 
          template_id: templateId, 
          template_name: template.name 
        }
      })
    );

    await Promise.all(promises);

    toast({
      title: \"Template enviado\",
      description: `Template \"${template.name}\" enviado a ${selectedContacts.length} contacto(s)`,
    });

    setSelectedContacts([]);
    setIsTemplateDialogOpen(false);
  } catch (error) {
    toast({
      title: \"Error\",
      description: \"Error al enviar el template\",
      variant: \"destructive\"
    });
  }
};
```

## 🔄 Integración con Base de Datos

### Estructura de Datos WhatsApp
```sql
-- Contactos WhatsApp
CREATE TABLE whatsapp_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT DEFAULT 'worker',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Conversaciones
CREATE TABLE whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES whatsapp_contacts(id),
  project_id UUID REFERENCES projects(id),
  title TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Mensajes
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES whatsapp_conversations(id),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'bot')),
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  template_data JSONB,
  created_at TIMESTAMP DEFAULT now()
);
```

### Políticas RLS
```sql
-- Usuarios autenticados pueden ver contactos
CREATE POLICY \"Authenticated users can view WhatsApp contacts\" 
ON whatsapp_contacts FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Solo supervisores pueden gestionar contactos
CREATE POLICY \"Supervisors can manage WhatsApp contacts\" 
ON whatsapp_contacts FOR ALL 
USING (get_user_role() = 'supervisor');

-- Sistema puede insertar mensajes
CREATE POLICY \"System can insert messages\" 
ON whatsapp_messages FOR INSERT 
WITH CHECK (true);
```

## 📊 Estados y Tipos de Datos

### Interfaces TypeScript
```typescript
interface WhatsAppContact {
  id: string;
  name: string;
  phone: string;
  role: 'worker' | 'supervisor' | 'manager';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface WhatsAppMessage {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'bot';
  message_text: string;
  message_type: 'text' | 'image' | 'template' | 'location';
  template_data?: {
    template_id: string;
    template_name: string;
    template_type: string;
  };
  created_at: string;
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  template_type: 'menu' | 'progress_form' | 'notification';
  content: {
    title: string;
    options?: Array<{
      label: string;
      value: string;
    }>;
    fields?: Array<{
      name: string;
      label: string;
      type: string;
      required: boolean;
    }>;
  };
  is_active: boolean;
}
```

## 🎯 Funcionalidades Futuras

### Integración WhatsApp API
- Conexión real con WhatsApp API
- Webhooks para mensajes entrantes
- Estados de entrega reales
- Multimedia (imágenes, documentos)

### Automatización Avanzada
- Chatbots con IA para respuestas automáticas
- Workflows de aprobación via WhatsApp
- Notificaciones programadas
- Integración con reportes de campo

### Analytics y Reportes
- Métricas de engagement
- Tiempos de respuesta
- Análisis de conversaciones
- Reportes de comunicación

---
**Documentado por**: Equipo de Frontend 
**Última actualización**: Enero 2025
