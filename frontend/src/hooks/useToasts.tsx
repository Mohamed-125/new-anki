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
    duration: number = 1500
  ) => {
    const toastData: ToastType = {
      title,
      duration,
      type,
    };

    setToasts((pre: ToastType[]) => [...pre, toastData]);
  };

  const deleteToast = (title: string) => {
    setToasts((pre) => pre.filter((toastItem) => toastItem.title !== title));
  };

  return { toasts, addToast, deleteToast };
};

export default useToasts;
