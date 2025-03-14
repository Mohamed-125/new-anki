import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Pin } from "lucide-react";
import ActionsDropdown from "../ActionsDropdown";
import SelectCheckBox from "../SelectCheckBox";
import useModalsStates from "@/hooks/useModalsStates";
import usePinSet from "@/hooks/usePinSet";
import { cn } from "@/lib/utils";

interface SetCardProps {
  id: string;
  name: string;
  subText?: string;
  isPinned?: boolean;
  moveHandler?: () => void;
  editHandler?: () => void;
  deleteHandler?: () => void;
  shareHandler?: () => void;
}

const SetCard = ({
  id,
  name,
  subText,
  isPinned: initialPinned = false,
  moveHandler,
  editHandler,
  deleteHandler,
  shareHandler,
}: SetCardProps) => {
  const { selectedItems, setSelectedItems } = useModalsStates();
  const { isPinned, isLoading, togglePin } = usePinSet({
    initialPinned,
    setId: id,
  });

  const handlePinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    togglePin();
  };

  const linkContent = (
    <div className="flex flex-1 gap-4 items-center">
      <div className="p-3 bg-blue-100 *:w-6 *:h-6 text-primary rounded-lg dark:bg-indigo-900/30">
        <BookOpen />
      </div>
      <div>
        <p className="flex-1 font-semibold">{name}</p>
        {subText && (
          <span className="text-sm font-medium text-grayColor">{subText}</span>
        )}
      </div>
    </div>
  );

  return (
    <div
      id={id}
      className="rounded-lg border p-6 py-7 text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg cursor-pointer bg-white dark:bg-[#242326] hover:translate-y-[-2px] border-[#e5e5e5] dark:border-[#2D2D2D] relative"
    >
      <button
        onClick={handlePinClick}
        disabled={isLoading}
        className={cn(
          "absolute top-2 right-2 p-2 rounded-full transition-colors",
          isPinned
            ? "text-yellow-500 hover:bg-yellow-50"
            : "text-gray-400 hover:bg-gray-50"
        )}
        aria-label={isPinned ? "Unpin set" : "Pin set"}
      >
        <Pin
          className={cn(
            "w-5 h-5",
            isPinned ? "fill-yellow-500" : "fill-transparent"
          )}
        />
      </button>

      <div className="flex items-center">
        <Link
          to={`${location.pathname}/${id}`}
          className="flex flex-1 gap-4 items-center"
        >
          {linkContent}
        </Link>
        <div onClick={(e) => e.stopPropagation()}>
          {id &&
            (!selectedItems.length ? (
              <ActionsDropdown
                moveHandler={moveHandler}
                editHandler={editHandler}
                deleteHandler={deleteHandler}
                shareHandler={shareHandler}
                itemId={id}
                setSelectedItems={setSelectedItems}
              />
            ) : (
              <SelectCheckBox
                id={id}
                setSelectedItems={setSelectedItems}
                selectedItems={selectedItems}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(SetCard);