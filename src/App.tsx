
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import Index from "./pages/Index";
import QRScan from "./pages/QRScan";
import LicenseCheck from "./pages/LicenseCheck";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { NetworkStatus } from "./components/NetworkStatus";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Mobile-optimized configuration
      retry: (failureCount, error) => {
        // Retry up to 3 times for network errors on mobile
        if (failureCount < 3 && navigator.onLine !== false) {
          return true;
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: (failureCount, error) => {
        // Retry mutations on mobile network issues
        if (failureCount < 2 && navigator.onLine !== false) {
          return true;
        }
        return false;
      },
      retryDelay: 1000,
    },
  },
});

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen w-full">
        <NetworkStatus />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/qr-scan" element={<QRScan />} />
              <Route path="/license-check" element={<LicenseCheck />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </div>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
