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
    const toast: ToastType = {
      title,
      duration,
      type: type,
      id: Math.random(),
      setToastData: function (data: { title?: string; isCompleted?: boolean }) {
        console.log("this", toast.id);
        setToasts((pre) => {
          return pre.map(function (currentToast) {
            if (currentToast.id === toast.id) {
              return { ...currentToast, ...data };
            }
            return currentToast;
          });
        });
      },
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
