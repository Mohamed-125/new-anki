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
    type: "success" | "error" | "info" | "promise" = "success",
    duration: number = 2500
  ) => {
    function setToastData(data: { title?: string; isCompleted?: boolean }) {
      setToasts((pre) => {
        return pre.map((currentToast) => {
          //@ts-ignore
          if (currentToast.id === (this as ToastType).id) {
            return { ...currentToast, ...data };
          }
          return currentToast;
        });
      });
    }

    const toast: ToastType = {
      title,
      duration,
      type: type,
      id: Math.random(),
      setToastData,
    };

    setToasts((pre: ToastType[]) => [...pre, toast]);
    return toast;
  };

  const deleteToast = (id: number) => {
    setToasts((pre) => pre.filter((toastItem) => toastItem.id !== id));
  };

  return { toasts, addToast, deleteToast, setToasts };
};

export default useToasts;
