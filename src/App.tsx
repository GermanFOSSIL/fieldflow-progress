import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";

// Pages
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import ProgressCapture from "./pages/ProgressCapture";
import ImportPlan from "./pages/ImportPlan";
import Approve from "./pages/Approve";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import WhatsAppChat from "./pages/WhatsAppChat";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
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
                    <Dashboard />
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
                    <WhatsAppChat />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;