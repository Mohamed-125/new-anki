import axios from "axios";
import React, { createContext, useEffect, useRef, useState } from "react";

export type ToastType = {
  title: string;
  duration: number;
  id: number;
  type: "error" | "success" | "info" | "promise";
  isCompleted?: boolean;
  isError?: boolean;
  setToastData(data: {
    title?: string;
    isCompleted?: boolean;
    type: "error" | "success" | "info" | "promise";
    isError?: boolean;
  }): void;
};

type ContextType = {
  toasts: ToastType[];
  setToasts: React.Dispatch<React.SetStateAction<ToastType[]>>;
};

export const toastContext = createContext<ContextType | null>(null);

const ToastContext = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  return (
    <toastContext.Provider value={{ toasts, setToasts }}>
      {children}
    </toastContext.Provider>
  );
};

export default ToastContext;
