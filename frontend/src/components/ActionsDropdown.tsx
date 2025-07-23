import React from "react";
import Button from "./Button";
import { FaTrashCan } from "react-icons/fa6";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { BsThreeDotsVertical } from "react-icons/bs";
import { LuMoveUpRight } from "react-icons/lu";
import { CheckCircle, PenBoxIcon, Plus, Share2 } from "lucide-react";
import useModalsStates from "@/hooks/useModalsStates";
import SelectCheckBox from "./SelectCheckBox";

type ActionsDropdownProps = {
  moveHandler?: any;
  editHandler?: any;
  deleteHandler?: any;
  shareHandler?: () => void;
  itemId: string;
  isCard?: boolean;
  setSelectedItems?: React.Dispatch<React.SetStateAction<string[]>>;
  forkData?: { forking: string; handler: any } | undefined;
  isSameUser?: boolean;
  customButtons?: Array<{
    label: string;
    icon: React.ReactNode;
    handler: () => void;
    className?: string;
  }>;
};

const ActionsDropdown = ({
  moveHandler,
  editHandler,
  deleteHandler,
  shareHandler,
  itemId,
  isCard,
  setSelectedItems,
  forkData,
  isSameUser = true,
  customButtons,
}: ActionsDropdownProps) => {
  const { selectedItems } = useModalsStates();

  return !selectedItems?.length ? (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          onClick={(e) => e.stopPropagation()}
          className="p-2 text-2xl rounded-md transition-all hover:bg-gray-100"
        >
          <BsThreeDotsVertical onClick={(e) => e.stopPropagation()} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mt-6 font-semibold !max-w-[250px]  bg-white dropdown-content">
          {setSelectedItems && (
            <>
              <Button
                className={
                  "flex gap-3 items-center  hover:bg-transparent hover:scale-100 !shadow-none leading-normal  text-gray-700 bg-transparent border-none outline-none"
                }
                onClick={() => {
                  setSelectedItems?.((pre) => {
                    return [...pre, itemId];
                  });
                }}
              >
                <CheckCircle className="text-xl" />
                Select
              </Button>
              <DropdownMenuSeparator />
            </>
          )}
          {forkData && (
            <>
              <Button
                onClick={forkData?.handler}
                className={
                  "flex gap-3 items-center text-left hover:bg-transparent hover:scale-100 !shadow-none leading-normal  text-gray-700 bg-transparent border-none outline-none"
                }
              >
                <Plus className="text-xl" />
                {forkData?.forking}
              </Button>
              <DropdownMenuSeparator />
            </>
          )}
          {shareHandler && (
            <>
              <Button
                onClick={shareHandler}
                className={
                  "flex gap-3 items-center  hover:bg-transparent hover:scale-100 !shadow-none leading-normal text-gray-700 bg-transparent border-none outline-none"
                }
              >
                <Share2 className="text-xl" />
                Share
              </Button>

              <DropdownMenuSeparator />
            </>
          )}

          {isSameUser && (
            <>
              {editHandler && (
                <>
                  <Button
                    onClick={editHandler}
                    className={
                      "flex gap-3 items-center leading-normal hover:bg-transparent hover:scale-100 !shadow-none text-gray-700 bg-transparent border-none outline-none"
                    }
                  >
                    <PenBoxIcon className="text-xl" />
                    Edit
                  </Button>
                  <DropdownMenuSeparator />
                </>
              )}

              {moveHandler && (
                <>
                  <Button
                    onClick={moveHandler}
                    className={
                      "flex gap-3 items-center  hover:bg-transparent hover:scale-100 !shadow-none leading-normal text-gray-700 bg-transparent border-none outline-none"
                    }
                  >
                    <LuMoveUpRight className="text-xl" />
                    Move
                  </Button>
                  <DropdownMenuSeparator />
                </>
              )}

              <Button
                className={
                  "flex gap-3 items-center  hover:bg-transparent hover:scale-100 !shadow-none leading-normal text-red-600 bg-transparent border-none outline-none"
                }
                onClick={deleteHandler}
              >
                <FaTrashCan className="text-xl" />
                Delete
              </Button>
              {customButtons?.map((button, index) => (
                <React.Fragment key={index}>
                  <DropdownMenuSeparator />
                  <Button
                    onClick={button.handler}
                    className={
                      button.className ||
                      "flex gap-3 items-center hover:bg-transparent hover:scale-100 !shadow-none leading-normal text-gray-700 bg-transparent border-none outline-none"
                    }
                  >
                    {button.icon}
                    {button.label}
                  </Button>
                </React.Fragment>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  ) : (
    <SelectCheckBox
      id={itemId}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
    />
  );
};

export default React.memo(ActionsDropdown);
