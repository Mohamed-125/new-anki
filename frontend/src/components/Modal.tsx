import React, {
  useRef,
  useEffect,
  ReactNode,
  NamedExoticComponent,
  ComponentType,
} from "react";
import { twMerge } from "tailwind-merge";
import Button from "./Button";
import { IoClose } from "react-icons/io5";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the props for the Modal component
interface ModalProps {
  children: React.ReactNode;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  className?: string;
  style?: React.CSSProperties;
  onAnimationEnd?: () => void;
  big?: boolean;
}

// Define the Modal component
const ModalComponent: NamedExoticComponent<ModalProps> = React.memo(
  function Modal({
    children,
    setIsOpen,
    className,
    isOpen,
    style,
    onAnimationEnd,
    big,
  }: ModalProps) {
    const modalRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";

        const timeout = setTimeout(() => {
          if (modalRef.current) {
            modalRef.current.scrollTop = 0;
          }
        }, 0);

        return () => clearTimeout(timeout);
      }
    }, [isOpen]);

    return (
      <div
        className={twMerge(
          "modal ",
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div
          className={twMerge(
            "transition-all duration-500 modal-backdrop",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => {
            setIsOpen(false);
          }}
        ></div>

        <div
          style={{
            ...style,
            transition: "transform 450ms ease, opacity 400ms ease",
          }}
          className={twMerge(
            "bg-white  !w-[90%] max-w-[550px] modal-content   translate-x-[-50%] z-[1500] fixed overflow-y-auto inset-2/4 h-fit rounded-2xl shadow-lg opacity-0",
            isOpen
              ? "opacity-1 translate-y-[-50%]"
              : "opacity-0 translate-y-[-30%]",
            big && "max-w-[1000px]",

            className
          )}
        >
          <div
            ref={modalRef}
            className={twMerge(
              "overflow-auto pb-32 modalScroll relative max-h-[650px]  px-10 ",
              big && "max-h-[90vh]"
            )}
          >
            {isOpen ? (
              children
            ) : (
              <div className="transition-opacity duration-75 opacity-0">
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

// Define the Header component
const Header: ComponentType<{
  title: string;
  children?: ReactNode;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openCollectionModal?: () => void;
}> = React.memo(function Header({
  title,
  children,
  openCollectionModal,
  setIsOpen,
}) {
  return (
    <div className="py-6 mb-6 border-b border-light-gray">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <div className="flex gap-2">
          {title === "Move To Collection" && (
            <Button
              onClick={openCollectionModal}
              className="grid w-10 h-10 transition-colors !p-0 duration-200 rounded-full place-items-center hover:bg-blue-400"
            >
              <PlusIcon className="text-[23px] font-medium" />
            </Button>
          )}
          <Button
            onClick={() => {
              setIsOpen(false);
            }}
            variant="danger"
            className="grid w-10 h-10 transition-colors !p-0 duration-200 rounded-full place-items-center hover:bg-red-400"
          >
            <IoClose className="text-[23px] font-medium" />
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
});
const Footer: ComponentType<{
  children?: ReactNode;
  className?: string;
}> = React.memo(function Header({ children, className }) {
  return (
    <div
      className={cn(
        "fixed bottom-0 px-10 bg-white right-0 left-0  py-6 mt-6 border-t border-light-gray",
        className
      )}
    >
      {children}
    </div>
  );
});

// Attach Header to ModalComponent
const Modal = Object.assign(ModalComponent, { Header, Footer });

export default Modal;
