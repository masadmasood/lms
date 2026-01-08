import App from "@/app/App.jsx";
import "@/styles/globals.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Configure React Query for instant data loading
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchInterval: 2 * 60 * 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        duration={3000}
        richColors={true}
        closeButton={true}
        style={{ fontFamily: "Poppins" }}
      />
    </QueryClientProvider>
  </StrictMode>
);
