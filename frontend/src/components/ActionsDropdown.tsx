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
import { CheckCircle, PenBoxIcon } from "lucide-react";
import useModalsStates from "@/hooks/useModalsStates";

type ActionsDropdownProps = {
  moveHandler?: any;
  editHandler?: any;
  deleteHandler?: any;
  itemId: string;
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
};

const ActionsDropdown = ({
  moveHandler,
  editHandler,
  deleteHandler,
  itemId,
  setSelectedItems,
}: ActionsDropdownProps) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="p-2 text-2xl transition-all rounded-md hover:bg-gray-100">
        <BsThreeDotsVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-6 font-semibold bg-white">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionsDropdown;
