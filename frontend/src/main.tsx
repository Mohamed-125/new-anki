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

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        //@ts-ignore
        if (error?.response?.status === 401) {
          return false; // 🔥 Don't retry if the error is 401 (Unauthorized)
        }
        return failureCount < 3; // Retry up to 3 times for other errors
      },
      refetchOnWindowFocus: false, // Disable refetching globally
      // refetchOnMount: false, // Don't refetch on component mount
    },

    mutations: {
      onSuccess: () => {
        // Invalidate all queries when any mutation succeeds
        queryClient.invalidateQueries();
      },
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
