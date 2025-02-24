type SelectedItemsControllerProps = {
  isItemsVideos?: boolean;
  isItemsCollections?: boolean;
  isItemsPlaylists?: boolean;
  isItemsNotes?: boolean;
  isItemsTexts?: boolean;
  isItemsCards?: boolean;
  moving?: string;
};
import React from "react";
import Button from "./Button";
import axios from "axios";
import { TextType } from "../pages/MyTexts";
import { IoClose } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import { MdDriveFileMove } from "react-icons/md";
import useModalStates from "@/hooks/useModalsStates";

const SelectedItemsController = ({
  isItemsVideos,
  isItemsCollections,
  isItemsPlaylists,
  isItemsNotes,
  isItemsTexts,
  isItemsCards,
  moving,
}: SelectedItemsControllerProps) => {
  const { selectedItems, setSelectedItems, setIsMoveToCollectionOpen } =
    useModalStates();

  console.log(selectedItems);
  return selectedItems.length ? (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-between w-full gap-4 px-6 bg-white border-t shadow-lg py-7 bg-opacity-90 backdrop-blur-sm py-4items-center border-neutral-200">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSelectedItems([])}
          className="flex items-center gap-2 text-xl text-gray-600 transition-colors hover:text-gray-900"
        >
          <IoClose />
        </button>

        <span className="text-lg font-semibold text-primary">
          {selectedItems?.length}{" "}
          {selectedItems.length === 1 ? "item" : "items"}
        </span>
        <span className="text-gray-400">|</span>
      </div>

      <div className="flex gap-6 items-center text-[16px]">
        {isItemsCards ||
        moving === "cards" ||
        isItemsCollections ||
        isItemsVideos ? (
          <button
            className="flex items-center gap-2 transition-colors text-primary hover:text-primary/80"
            onClick={() => {
              setIsMoveToCollectionOpen(true);
            }}
          >
            <MdDriveFileMove className="text-3xl" />
            <span>
              {isItemsVideos ? "Move to Playlist" : "Move to Collection"}
            </span>
          </button>
        ) : null}

        <button
          className="flex items-center gap-2 text-red-500 transition-colors hover:text-red-600"
          onClick={async () => {
            const url = isItemsVideos
              ? `video/batch-delete`
              : isItemsCollections
              ? `collection/batch-delete`
              : isItemsPlaylists
              ? `playlist/batch-delete`
              : isItemsNotes
              ? `note/batch-delete`
              : isItemsTexts
              ? `text/batch-delete`
              : `card/batch-delete`;

            const confirmation = window.confirm(
              "Are you sure you want to delete all selected items?"
            );
            if (confirmation) {
              selectedItems.forEach((item) => {
                const itemElement = document.getElementById(item);
                itemElement?.remove();
              });

              await axios.post(url, { ids: selectedItems });
              // setItemsState?.((pre: string[]) =>
              //   //@ts-ignore
              //   pre.filter((item: TextType) => selectedItems.includes(item._id))
              // );
              setSelectedItems([]);
            }
          }}
        >
          <FaTrash className="text-xl" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  ) : null;
};

export default SelectedItemsController;
