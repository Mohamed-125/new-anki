import axios from "axios";
import React, { createContext, useEffect, useRef, useState } from "react";

export type ToastType = {
  title: string;
  duration: number;
  id: number;
  type: "error" | "success" | "info";
};

type ContextType = {
  toasts: ToastType[];
  setToasts: React.Dispatch<React.SetStateAction<ToastType[]>>;
};

export const toastContext = createContext<ContextType | null>(null);

const ToastContext = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  // useEffect(() => {
  //   if (toasts.length === 0) return;

  //   let lastToast = toasts[toasts.length - 1];
  //   setTimeout(() => {
  //     setToasts((pre) => pre.filter((toast) => toast.id !== lastToast.id));
  //   }, lastToast.duration);
  // }, [toasts]);

  return (
    <toastContext.Provider value={{ toasts, setToasts }}>
      {children}
    </toastContext.Provider>
  );
};

export default ToastContext;
