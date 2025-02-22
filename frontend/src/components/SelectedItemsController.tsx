type SelectedItemsControllerProps = {
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  setChangeItemsParent?: React.Dispatch<React.SetStateAction<boolean>>;
  isItemsVideos?: boolean;
  isItemsCollections?: boolean;
  isItemsPlaylists?: boolean;
  isItemsNotes?: boolean;
  isItemsTexts?: boolean;
  isItemsCards?: boolean;
  setItemsState?: React.Dispatch<React.SetStateAction<any>>;
  setIsMoveToCollectionOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  moving?: string;
};
import React from "react";
import Button from "./Button";
import axios from "axios";
import { TextType } from "../pages/MyTexts";
import { IoClose } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import { MdDriveFileMove } from "react-icons/md";

const SelectedItemsController = ({
  selectedItems,
  setSelectedItems,
  isItemsVideos,
  isItemsCollections,
  isItemsPlaylists,
  setChangeItemsParent,
  isItemsNotes,
  isItemsTexts,
  isItemsCards,
  setItemsState,
  setIsMoveToCollectionOpen,
  moving,
}: SelectedItemsControllerProps) => {
  return selectedItems.length ? (
    <div className="flex fixed right-0 bottom-0 left-0 z-50 gap-4 justify-between px-6 py-7 w-full bg-white bg-opacity-90 border-t shadow-lg backdrop-blur-sm py-4items-center border-neutral-200">
      <div className="flex gap-3 items-center">
        <button
          onClick={() => setSelectedItems([])}
          className="flex gap-2 items-center text-xl text-gray-600 transition-colors hover:text-gray-900"
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
        {setChangeItemsParent && moving === "cards" && (
          <button
            className="flex gap-2 items-center transition-colors text-primary hover:text-primary/80"
            onClick={() => {
              isItemsCollections || isItemsCards
                ? setIsMoveToCollectionOpen?.(true)
                : setChangeItemsParent(true);
            }}
          >
            <MdDriveFileMove className="text-xl" />
            <span>
              {isItemsVideos ? "Move to Playlist" : "Move to Collection"}
            </span>
          </button>
        )}

        <button
          className="flex gap-2 items-center text-red-500 transition-colors hover:text-red-600"
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
              setItemsState?.((pre: string[]) =>
                //@ts-ignore
                pre.filter((item: TextType) => selectedItems.includes(item._id))
              );
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
