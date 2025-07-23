import React, {
  useRef,
  useEffect,
  NamedExoticComponent,
  ComponentType,
  ReactNode,
} from "react";
import { IoClose } from "react-icons/io5";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWindowSize } from "react-use";
import { Dialog, DialogContent, DialogClose, DialogPortal } from "./ui/dialog";
import Button from "./Button";
import { createPortal } from "react-dom";
import { DrawerContent, Drawer } from "./ui/Drawer";

// Define the props for the Modal component
interface ModalProps {
  children: React.ReactNode;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  className?: string;
  style?: React.CSSProperties;
  onAnimationEnd?: () => void;
  big?: boolean;
  loading?: boolean;
  id?: string;
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
    loading = false,
    id,
  }: ModalProps) {
    const modalRef = useRef<null | HTMLDivElement>(null);
    const prevIsOpenRef = useRef(isOpen);

    useEffect(() => {
      if (prevIsOpenRef.current && !isOpen && onAnimationEnd) {
        onAnimationEnd();
      }
      prevIsOpenRef.current = isOpen;
    }, [isOpen, onAnimationEnd]);

    const isMobile = useWindowSize().width < 700;

    return createPortal(
      isMobile ? (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent>
            {loading ? (
              <div className="">
                <div className="grid absolute inset-0 z-50 place-items-center w-full h-full bg-white">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-200 animate-spin border-t-primary"></div>
                </div>
                <div
                  id={id}
                  ref={modalRef}
                  className={cn(
                    "overflow-auto pb-32 modalScroll z-10 relative max-h-[650px] transition-all duration-300 ease-out",
                    big && "max-h-[90vh]"
                  )}
                >
                  {isOpen ? children : null}
                </div>
              </div>
            ) : (
              <div
                id={id}
                ref={modalRef}
                className={cn(
                  "overflow-auto [&_*]:transform-gpu [&_*]:translate-x-0 pb-5 px-5 modalScroll relative max-h-[650px]",
                  big && "max-h-[90vh]"
                )}
              >
                {children}
              </div>
            )}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogPortal>
            <DialogContent
              style={style}
              className={cn(
                "bg-white !w-[90%] max-w-[550px] overflow-hidden z-[1500] overflow-y-auto h-fit rounded-2xl shadow-lg p-0",
                big && "max-w-[1000px]",
                className
              )}
            >
              {loading ? (
                <div className="relative">
                  <div className="grid absolute inset-0 z-50 place-items-center w-full h-full bg-white">
                    <div className="w-12 h-12 rounded-full border-4 border-blue-200 animate-spin border-t-primary"></div>
                  </div>
                  <div
                    id={id}
                    ref={modalRef}
                    className={cn(
                      "overflow-auto pb-32 modalScroll z-10 relative max-h-[650px] px-10",
                      big && "max-h-[90vh]"
                    )}
                  >
                    {isOpen ? children : null}
                  </div>
                </div>
              ) : (
                <div
                  id={id}
                  ref={modalRef}
                  className={cn(
                    "overflow-auto pb-32 modalScroll relative max-h-[650px] px-10",
                    big && "max-h-[90vh]"
                  )}
                >
                  {children}
                </div>
              )}
            </DialogContent>
          </DialogPortal>
        </Dialog>
      ),
      document.getElementById("modal-root")!
    );
  }
);

// Define the Header component
const Header: ComponentType<{
  title: string | ReactNode;
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
      <div className="flex justify-between items-center [&_*]:transform-gpu [&_*]:translate-x-0">
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
          <DialogClose asChild>
            <Button
              onClick={() => {
                setIsOpen(false);
              }}
              variant="danger"
              className="grid w-10 h-10 transition-colors !p-0 duration-200 rounded-full place-items-center hover:bg-red-400"
            >
              <IoClose className="text-[23px] font-medium" />
            </Button>
          </DialogClose>
        </div>
      </div>
      {children}
    </div>
  );
});

const Footer: ComponentType<{
  children?: ReactNode;
  className?: string;
}> = React.memo(function Footer({ children, className }) {
  const { width } = useWindowSize();
  const isMobile = width < 700;

  return (
    <div
      className={cn(
        "fixed right-0 bottom-0 left-0 px-10 py-6 mt-6 bg-white border-t border-light-gray",
        className,
        isMobile && "static"
      )}
    >
      {children}
    </div>
  );
});

// Attach Header and Footer to ModalComponent
const Modal = Object.assign(ModalComponent, { Header, Footer });

export default Modal;
