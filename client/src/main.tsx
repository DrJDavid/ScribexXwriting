import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { ProgressProvider } from "./context/ProgressContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";

// Setup providers in the correct order
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <ProgressProvider>
          <App />
        </ProgressProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);
