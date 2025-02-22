import React, { useRef, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

const Modal = React.memo(
  ({
    children,
    setIsOpen,
    className,
    isOpen,
    style,
    onAnimationEnd,
  }: {
    children: React.ReactNode;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isOpen: boolean;
    className?: string;
    style?: React.CSSProperties;
    onAnimationEnd?: any;
  }) => {
    const modalRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
      if (isOpen) {
        const firstInput = document.querySelector(
          ".modal input"
        ) as HTMLInputElement;

        firstInput?.focus();
      }
    }, [isOpen]);

    const [firstRender, setFirstRednder] = useState(false);
    useEffect(() => {
      if (isOpen) {
        setFirstRednder(true);
        return;
      }
    }, [isOpen]);

    return (
      <div
        onTransitionEnd={isOpen ? undefined : onAnimationEnd}
        ref={modalRef}
        className={twMerge(
          "modal",
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
          style={{
            ...style,
            transition: "transform 520ms ease, opacity 420ms ease",
          }}
          className={twMerge(
            "bg-white  px-4 modal-content translate-y-[-30%] translate-x-[-50%] z-[1500] fixed max-h-[90%] overflow-y-auto inset-2/4 min-h-[80vh] h-fit rounded-xl w-[90%] max-w-[730px] opacity-0",
            isOpen
              ? "opacity-1 translate-y-[-50%]"
              : "opacity-0 translate-y-[-30%]",
            className
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);
export default Modal;
