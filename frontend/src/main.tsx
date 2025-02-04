import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./index.css";
import axios from "axios";
import UserContext from "./context/UserContext.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toasts from "./components/Toasts.js";
import ToastContext from "./context/ToastContext.js";
import CollectionsContext from "./context/CollectionsContext.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disable refetching globally
    },
  },
});
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserContext>
        <CollectionsContext>
          <ToastContext>
            <Toasts />
            <App />
          </ToastContext>
        </CollectionsContext>
      </UserContext>
    </QueryClientProvider>
  </StrictMode>
);
