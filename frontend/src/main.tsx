import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./index.css";
import axios from "axios";
import UserContext from "./context/UserContext.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toasts from "./components/Toasts.js";
import ToastContext from "./context/ToastContext.js";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserContext>
        <ToastContext>
          <Toasts />
          <App />
        </ToastContext>
      </UserContext>
    </QueryClientProvider>
  </StrictMode>
);
