import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import ProgressCapture from "./pages/ProgressCapture";
import ImportPlan from "./pages/ImportPlan";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="capture" element={<ProgressCapture />} />
            <Route path="import" element={<ImportPlan />} />
            <Route path="approve" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Approval Workflow</h1><p className="text-muted-foreground">Connect to Supabase to enable supervisor approval features</p></div>} />
            <Route path="reports" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Reports & Export</h1><p className="text-muted-foreground">PDF generation and CSV export features</p></div>} />
            <Route path="analytics" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Advanced Analytics</h1><p className="text-muted-foreground">S-Curve analysis and progress forecasting</p></div>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
