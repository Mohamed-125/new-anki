import { ChevronDownIcon } from "lucide-react";
import { ReactNode, useState } from "react";

interface AccordionProps {
  title: ReactNode;
  children: ReactNode;
  isLoading?: boolean;
  onClick?: () => void;
}

const Accordion = ({ title, children, isLoading, onClick }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden mb-4 rounded-lg border">
      <button
        className={`w-full p-4 flex justify-between items-center bg-white hover:bg-gray-50 ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => {
          !isLoading && setIsOpen(!isOpen);
          onClick?.();
        }}
        disabled={isLoading}
      >
        <div className="flex-1 font-semibold text-left">{title}</div>
        <ChevronDownIcon
          className={`w-5 h-5 transition-transform ${
            isOpen ? "transform rotate-180" : ""}`}
        />
      </button>
      {isOpen && <div className="p-4 bg-gray-50 border-t">{children}</div>}
    </div>
  );
};

export default Accordion;
