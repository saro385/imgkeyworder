import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { LicenseState } from "./types";
import ProjectSettings from "./pages/ProjectSettings"; // Import the new component

const queryClient = new QueryClient();

const App = () => {
  const [licenseState, setLicenseState] = useState<LicenseState>({
    isAuthenticated: false,
    hasChecked: false,
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("license_authenticated") === "true";
    setLicenseState({
      isAuthenticated,
      hasChecked: true,
    });
  }, []);

  const handleAuthenticate = () => {
    setLicenseState({
      isAuthenticated: true,
      hasChecked: true,
    });
  };

  if (!licenseState.hasChecked) {
    return null;
  }

  if (!licenseState.isAuthenticated) {
    return <Auth onAuthenticate={handleAuthenticate} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/project/:id" element={<Index />} />
            <Route path="/project/:id/settings" element={<ProjectSettings />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
