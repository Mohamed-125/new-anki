import React, { useEffect, useState } from "react";
import { MdError } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { FaCircleInfo } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import useToasts from "../hooks/useToasts";
import { ToastType } from "../context/ToastContext";

const Toasts = () => {
  const { toasts, deleteToast } = useToasts();

  // Auto-delete toast after a duration (e.g., 3 seconds)
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        const toast = toasts[0]; // Get the first toast to remove it after the delay
        if (toast) deleteToast(toast.title);
      }, 2000); // 3 seconds delay
      return () => clearTimeout(timer); // Clean up timeout on component unmount
    }
  }, [toasts, deleteToast]);

  return (
    <AnimatePresence mode="popLayout">
      <div className="fixed top-[95px] right-4 w-full max-w-[300px] space-y-3">
        {toasts.reverse().map((toast, i) => {
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key={i}
              onClick={() => {
                deleteToast(toast.title);
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
        })}
      </div>
    </AnimatePresence>
  );
};

export default Toasts;
