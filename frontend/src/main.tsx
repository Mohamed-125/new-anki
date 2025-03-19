import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./index.css";
import axios from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toasts from "./components/Toasts.js";
import ToastContext from "./context/ToastContext.js";
import StatesContext from "./context/StatesContext.js";
import { LanguageProvider } from "./context/SelectedLearningLanguageContext.js";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

// Add a request interceptor to include language in all POST requests
axios.interceptors.request.use(function (config) {
  // Import the language from your context
  let language = localStorage.getItem("selectedLearningLanguage") || "en";

  // Remove any quotes if they exist
  if (language.startsWith('"') && language.endsWith('"')) {
    language = language.slice(1, -1);
  }

  // Only modify POST requests
  if (config.method === "post") {
    if (config.data?.language) config.data.language = language;
  }
  return config;
});

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
      staleTime: 1000 * 60,
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
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <>
          <ToastContext>
            <StatesContext>
              <Toasts />
              <App />
            </StatesContext>
          </ToastContext>
        </>
      </QueryClientProvider>
    </LanguageProvider>
  </StrictMode>
);
