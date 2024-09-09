import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import axios from "axios";
import UserContext from "./context/UserContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:5000/api/v1/";
axios.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    // if(e)
  }
);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <QueryClientProvider client={queryClient}>
    <UserContext>
      <App />
    </UserContext>
  </QueryClientProvider>
  // </StrictMode>
);
