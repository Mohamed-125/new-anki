import React, { useEffect, useState } from "react";
import { MdError } from "react-icons/md";
import { FaCheck, FaCheckCircle } from "react-icons/fa";
import { FaCircleInfo } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import useToasts from "../hooks/useToasts";
import { ToastType } from "../context/ToastContext";
import { XIcon } from "lucide-react";

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
    // console.log(toast);
    if (toast.type === "promise") {
      if (toast.isCompleted) {
        // console.log("toast not completed should not be removed");
        return;
      }
      if (!toast.isError) {
        // console.log("toast not completed should not be removed");
        return;
      }
    }

    // console.log("toast should be removed");
    const timeout = setTimeout(() => {
      setToasts((pre) =>
        pre.filter((currentToast) => currentToast.id !== toast.id)
      );
    }, toast.duration + 350);

    return () => {
      clearTimeout(timeout);
    };
  }, [toast]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, x: "100%" }}
      animate={{ opacity: 1, scale: 1, x: "0%" }}
      exit={{ opacity: 0, scale: 0.9, x: "100%" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={() => {
        deleteToast(toast.id);
      }}
      className={twMerge(
        "flex items-center relative h-[55px]  w-full gap-3 px-4 py-3 bg-white rounded-lg shadow-lg border  cursor-pointer ",
        toast.type === "error"
          ? "border-red-500"
          : toast.type === "success"
          ? "border-green-500"
          : toast.type === "promise"
          ? "border-gray-200"
          : "border-primary"
      )}
    >
      {toast.type === "error" ? (
        <AnimatedError />
      ) : toast.type === "success" ? (
        <AnimatedCheck />
      ) : toast.type === "promise" ? (
        <PromiseToSuccess toast={toast} />
      ) : (
        <FaCircleInfo className="text-priborder-primary size-7" />
      )}
      <p className="text-sm font-medium text-gray-700 grow">{toast.title}</p>
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <XIcon className="text-gray-400 size-4 hover:text-gray-600" />
      </motion.div>
    </motion.div>
  );
};

const AnimatedCheck = () => (
  <motion.svg
    viewBox="0 0 24 24"
    className="size-7"
    strokeWidth={2.5}
    fill="none"
  >
    <motion.circle
      cx="12"
      cy="12"
      r="10"
      className="fill-green-500 stroke-green-500"
      initial={{ scale: 0.1, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    />
    <motion.path
      d="M8 12.5L11 15.5L16 9.5"
      className="stroke-white"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
    />
  </motion.svg>
);

const AnimatedError = () => (
  <motion.svg viewBox="0 0 24 24" className="size-7" strokeWidth={2.5}>
    <motion.circle
      cx="12"
      cy="12"
      r="10"
      className="fill-red-500 stroke-red-500"
      initial={{ scale: 0.1, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    />
    <motion.path
      d="M15 9L9 15M9 9l6 6"
      className="stroke-white"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
    />
  </motion.svg>
);

const PromiseToSuccess = ({ toast }: { toast: ToastType }) => {
  if (toast.isCompleted) {
    return <AnimatedCheck />;
  }
  if (toast.isError) {
    return <AnimatedError />;
  }

  return <div className="!static  ml-[2px]  loader "></div>;
};
