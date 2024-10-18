import React, { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

const Modal = ({
  children,
  setIsOpen,
  className,
  isOpen,
  style,
}: {
  children: React.ReactNode;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <div
      className={twMerge(
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      <div
        className={twMerge(
          "transition-all duration-300 modal-backdrop",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={(e) => {
          setIsOpen?.(false);
        }}
      ></div>

      <div
        style={style}
        className={twMerge(
          "bg-white  px-4 z-[1500] fixed transition-all duration-300 max-h-[90%] overflow-y-auto inset-2/4 h-fit -translate-x-2/4 -translate-y-2/4 rounded-2xl w-[90%] max-w-[730px] ",
          isOpen
            ? "opacity-100 -translate-y-[50%]"
            : "opacity-0 -translate-y-[35%]",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
