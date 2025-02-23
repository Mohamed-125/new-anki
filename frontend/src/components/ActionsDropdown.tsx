import React, { useEffect, useId, useState } from "react";
import Button from "./Button";
import { FaTrashCan } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { twMerge } from "tailwind-merge";
import useCardActions from "../hooks/useCardActions";
import { CollectionType } from "@/context/CollectionsContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { BsThreeDotsVertical } from "react-icons/bs";
import { LuMoveUpRight } from "react-icons/lu";
import { PenBoxIcon } from "lucide-react";

type ActionsDropdownProps = {
  moveHandler?: () => void;
  renameHandler?: () => void;
  deleteHandler?: () => void;
};

const ActionsDropdown = ({
  moveHandler,
  renameHandler,
  deleteHandler,
}: ActionsDropdownProps) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="p-2 text-2xl transition-all rounded-md hover:bg-gray-100">
        <BsThreeDotsVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-6 font-semibold bg-white">
        {renameHandler && (
          <>
            <Button
              onClick={renameHandler}
              className={
                "flex gap-3 items-center leading-normal hover:bg-transparent hover:scale-100 !shadow-none text-gray-700 bg-transparent border-none outline-none"
              }
            >
              <PenBoxIcon className="text-xl" />
              Rename
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
