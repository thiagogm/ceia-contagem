import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Dashboard } from "./pages/Dashboard.tsx";
import { Contagem } from "./pages/Contagem.tsx";
import { ReportPage } from "./pages/ReportPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import { SantaCeiaProvider } from "@/hooks/use-santa-ceia-store";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SantaCeiaProvider>
        <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contagem" element={<Contagem />} />
          <Route path="/relatorio/:id" element={<ReportPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </SantaCeiaProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
