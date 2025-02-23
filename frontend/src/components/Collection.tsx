import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Actions from "./Actions";
import { CollectionType } from "@/context/CollectionsContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { BsThreeDotsVertical } from "react-icons/bs";
import Button from "./Button";
import { FaTrashCan } from "react-icons/fa6";
import { useQueryClient } from "@tanstack/react-query";
import { Folder, PenBoxIcon } from "lucide-react";
import axios from "axios";
import { LuMoveUpRight } from "react-icons/lu";

type CollectionProps = {
  collection: CollectionType;
  setDefaultValues: any;
  setIsMoveToCollectionOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEditId: React.Dispatch<React.SetStateAction<string>>;
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  selectedItems: string[];
  setIsCollectionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setToMoveCollectionId: React.Dispatch<React.SetStateAction<string>>;
  // setMoving: React.Dispatch<React.SetStateAction<string>>;
};

const Collection = ({
  collection,
  setDefaultValues,
  setIsMoveToCollectionOpen,
  setEditId,
  setIsCollectionModalOpen,
  setSelectedItems,
  selectedItems,
  // setMoving,

  setToMoveCollectionId,
}: CollectionProps) => {
  const id = collection._id;
  const isSelected = selectedItems.includes(id);
  const location = useLocation(); // Get the current path
  const queryClient = useQueryClient();

  const deleteHandler = (collectionId: string) => {
    axios
      .delete(`collection/${collectionId}`)
      .then((res) => {
        queryClient.invalidateQueries({ queryKey: ["collections"] });
        queryClient.invalidateQueries({
          queryKey: ["collection", collection.parentCollectionId],
        });
      })
      .catch((err) => err);
  };

  return (
    <div
      id={id}
      key={id}
      className="rounded-lg border  p-6 py-8 text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg cursor-pointer bg-white dark:bg-[#242326] hover:translate-y-[-2px] border-[#e5e5e5] dark:border-[#2D2D2D]"
    >
      <div>
        <div className="flex items-center ">
          {/* <input
            checked={isSelected}
            type="checkbox"
            className="!min-w-6 !h-6 "
            onChange={(e) => {
              setSelectedItems((pre) => {
                if (e.target.checked) {
                  return [...pre, id];
                } else {
                  return [...pre.filter((item) => item !== id)];
                }
              });
            }}
          /> */}
          <Link
            to={`${location.pathname}/${id}`}
            className="flex items-center flex-1 gap-4"
          >
            <div
              data-lov-name="div"
              data-component-line="70"
              className="p-3 bg-blue-100 rounded-lg dark:bg-indigo-900/30"
            >
              <Folder className="w-6 h-6 text-primary " />{" "}
            </div>
            <div>
              <p className="flex-1 font-semibold">{collection.name}</p>
              <span className="text-sm font-medium text-grayColor">
                {collection.collectionCards.length} Cards
              </span>
            </div>
          </Link>

          {collection._id && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="p-2 text-2xl transition-all rounded-md hover:bg-gray-100">
                <BsThreeDotsVertical />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-6 font-semibold">
                <Button
                  onClick={() => {
                    setEditId(id);
                    setDefaultValues({
                      collectionName: collection?.name,
                      collectionPublic: collection?.public,
                    });
                    setIsCollectionModalOpen(true);
                  }}
                  className={
                    "flex gap-3 items-center leading-normal text-gray-700 bg-transparent border-none outline-none"
                  }
                >
                  <PenBoxIcon className="text-xl" />
                  Rename
                </Button>
                <DropdownMenuSeparator />

                <Button
                  onClick={() => {
                    setEditId(id);
                    setIsMoveToCollectionOpen(true);
                    setToMoveCollectionId(collection._id);
                  }}
                  className={
                    "flex gap-3 items-center leading-normal text-gray-700 bg-transparent border-none outline-none"
                  }
                >
                  <LuMoveUpRight className="text-xl" />
                  Move
                </Button>

                <DropdownMenuSeparator />

                <Button
                  className={
                    "flex gap-3 items-center leading-normal text-red-600 bg-transparent border-none outline-none"
                  }
                  onClick={() => {
                    deleteHandler(id);
                  }}
                >
                  <FaTrashCan className="text-xl" />
                  Delete
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;
