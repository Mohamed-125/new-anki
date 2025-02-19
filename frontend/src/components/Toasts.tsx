import React, { useEffect, useState } from "react";
import { MdError } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { FaCircleInfo } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import useToasts from "../hooks/useToasts";
import { ToastType } from "../context/ToastContext";

const Toasts = () => {
  const { toasts } = useToasts();

  return (
    <motion.div className="fixed top-[95px] z-50 right-4 w-full max-w-[300px] space-y-3">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, i) => {
          return <Toast key={toast.id} toast={toast} />;
        })}
      </AnimatePresence>{" "}
    </motion.div>
  );
};

export default Toasts;

const Toast = ({ toast }: { toast: ToastType }) => {
  const { deleteToast, setToasts } = useToasts();
  useEffect(() => {
    const timeout = setTimeout(() => {
      setToasts((pre) =>
        pre.filter((currentToast) => currentToast.id !== toast.id)
      );
    }, toast.duration + 350);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const transition = {
    duration: 0.35,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={transition}
      onClick={() => {
        deleteToast(toast.id);
      }}
      className={twMerge(
        "flex items-center w-full text-xl gap-4 px-5 py-6   bg-white rounded-lg shadow-lg cursor-pointer",
        toast.type === "error"
          ? "bg-red-600 text-white"
          : toast.type === "success"
          ? "bg-green-600 text-white"
          : "bg-transparent"
      )}
    >
      {toast.type === "error" ? (
        <MdError className="size-9" />
      ) : toast.type === "success" ? (
        <FaCheck className="size-8" />
      ) : (
        <FaCircleInfo className="size-9 " />
      )}
      <p>{toast.title}</p>
    </motion.div>
  );
};
