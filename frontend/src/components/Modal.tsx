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
            `bg-white px-6
            h-full
            max-h-fit
             py-4 modal-content overflow-hidden translate-y-[-30%] translate-x-[-50%] z-[1500] fixed  inset-2/4  rounded-2xl w-[95%] max-w-[600px] shadow-lg opacity-0 `,
            isOpen
              ? "opacity-1 translate-y-[-50%]"
              : "opacity-0 translate-y-[-30%]",
            className
          )}
        >
          <div className="overflow-auto h-fit max-h-[600px] modalScroll">
            {children}
          </div>
        </div>
      </div>
    );
  }
);
export default Modal;
