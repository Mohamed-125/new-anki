import React, { useContext } from "react";
import { toastContext } from "../context/ToastContext";
import type { ToastType } from "../context/ToastContext";

const useToasts = () => {
  const data = useContext(toastContext);
  if (!data) {
    throw new Error("must use within the toast provider");
  }

  const { toasts, setToasts } = data;

  const addToast = (
    title: string,
    type: "success" | "error" | "info",
    duration: number = 2500
  ) => {
    const toastData: ToastType = {
      title,
      duration,
      type,
      id: Math.random(),
    };

    setToasts((pre: ToastType[]) => [...pre, toastData]);
  };

  const deleteToast = (id: number) => {
    setToasts((pre) => pre.filter((toastItem) => toastItem.id !== id));
  };

  return { toasts, addToast, deleteToast, setToasts };
};

export default useToasts;
