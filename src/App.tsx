import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";

// Pages
import Welcome from "./pages/Welcome";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import ProgressCapture from "./pages/ProgressCapture";
import ImportPlan from "./pages/ImportPlan";
import Approve from "./pages/Approve";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import WhatsApp from "./pages/WhatsApp";
import AIAssistant from "./pages/AIAssistant";
import WhatsAppTemplateAdmin from "./pages/WhatsAppTemplateAdmin";
import DatabaseAdmin from "./pages/DatabaseAdmin";
import ProjectManagement from "./pages/ProjectManagement";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ProjectProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Página pública */}
            <Route 
              path="/" 
              element={
                <PublicLayout>
                  <Welcome />
                </PublicLayout>
              } 
            />
            
            {/* Autenticación */}
            <Route 
              path="/auth" 
              element={
                <PublicLayout>
                  <Auth />
                </PublicLayout>
              } 
            />
            
            {/* Rutas protegidas con nueva navegación */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <ExecutiveDashboard />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/capture" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <ProgressCapture />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/approve" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <Approve />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/import" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <ImportPlan />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <ProjectManagement />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <Reports />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <Analytics />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/whatsapp" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <WhatsApp />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai-assistant" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <AIAssistant />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/whatsapp-templates" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <WhatsAppTemplateAdmin />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/database" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <DatabaseAdmin />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/executive" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <ExecutiveDashboard />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <Settings />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </ProjectProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;