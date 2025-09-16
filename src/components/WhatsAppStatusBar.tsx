import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Users, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from "lucide-react";

interface WhatsAppStats {
  totalMessages: number;
  activeChats: number;
  pendingAlerts: number;
  responseTime: string;
  automationRate: number;
}

const mockStats: WhatsAppStats = {
  totalMessages: 127,
  activeChats: 8,
  pendingAlerts: 3,
  responseTime: "2.3 min",
  automationRate: 85
};

export function WhatsAppStatusBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Mensajes hoy</p>
              <p className="text-xl font-semibold">{mockStats.totalMessages}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-success" />
            <div>
              <p className="text-sm text-muted-foreground">Chats activos</p>
              <p className="text-xl font-semibold">{mockStats.activeChats}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Alertas pendientes</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-semibold">{mockStats.pendingAlerts}</p>
                {mockStats.pendingAlerts > 0 && (
                  <Badge variant="destructive" className="text-xs">Urgente</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Tiempo respuesta</p>
              <p className="text-xl font-semibold">{mockStats.responseTime}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-chart-success" />
            <div>
              <p className="text-sm text-muted-foreground">Automatización</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-semibold">{mockStats.automationRate}%</p>
                <CheckCircle className="h-3 w-3 text-success" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}