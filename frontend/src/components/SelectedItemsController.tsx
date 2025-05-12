type SelectedItemsControllerProps = {
  isItemsVideos?: boolean;
  isItemsCollections?: boolean;
  isItemsPlaylists?: boolean;
  isItemsNotes?: boolean;
  isItemsTexts?: boolean;
  isItemsCards?: boolean;
  isItemsLists?: boolean;
  moving?: string;
  setMoveVideoModal?: React.Dispatch<React.SetStateAction<boolean>>;
  allItems: string[];
};
import React from "react";
import Button from "./Button";
import axios from "axios";
import { TextType } from "../pages/MyTexts";
import { IoClose } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import { MdDriveFileMove } from "react-icons/md";
import useModalStates from "@/hooks/useModalsStates";
import { useQueryClient } from "@tanstack/react-query";

const SelectedItemsController = ({
  isItemsVideos,
  isItemsCollections,
  isItemsPlaylists,
  isItemsNotes,
  isItemsTexts,
  isItemsCards,
  isItemsLists,
  moving,
  setMoveVideoModal,
  allItems = [],
}: SelectedItemsControllerProps) => {
  const { selectedItems, setSelectedItems, setIsMoveToCollectionOpen } =
    useModalStates();

  const queryClient = useQueryClient();

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
        {allItems && (
          <button
            onClick={() => {
              if (selectedItems.length === allItems.length) {
                setSelectedItems([]);
              } else {
                setSelectedItems(allItems);
              }
            }}
            className="flex gap-2 items-center transition-colors text-primary hover:text-primary/80"
          >
            <span>
              {selectedItems.length === allItems.length
                ? "Deselect All"
                : "Select All"}
            </span>
          </button>
        )}
      </div>

      <div className="flex gap-6 items-center text-[16px]">
        {isItemsCards ||
        moving === "cards" ||
        isItemsCollections ||
        isItemsVideos ? (
          <button
            className="flex gap-2 items-center transition-colors text-primary hover:text-primary/80"
            onClick={() => {
              setIsMoveToCollectionOpen(true);
              setMoveVideoModal?.(true);
            }}
          >
            <MdDriveFileMove className="text-3xl" />
            <span>
              {isItemsVideos ? "Move to Playlist" : "Move to Collection"}
            </span>
          </button>
        ) : null}

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
              : isItemsLists
              ? `list/batch-delete`
              : `card/batch-delete`;

            const confirmation = window.confirm(
              "Are you sure you want to delete all selected items?"
            );
            if (confirmation) {
              await axios.post(url, { ids: selectedItems });
              // setItemsState?.((pre: string[]) =>
              //   //@ts-ignore
              //   pre.filter((item: TextType) => selectedItems.includes(item._id))
              // );
              if (isItemsVideos) {
                queryClient.invalidateQueries({ queryKey: ["videos"] });
                queryClient.invalidateQueries({ queryKey: ["video"] });
              } else if (isItemsCollections) {
                queryClient.invalidateQueries({ queryKey: ["collections"] });
                queryClient.invalidateQueries({ queryKey: ["collection"] });
              } else if (isItemsPlaylists) {
                queryClient.invalidateQueries({ queryKey: ["playlists"] });
                queryClient.invalidateQueries({ queryKey: ["playlist"] });
              } else if (isItemsNotes) {
                queryClient.invalidateQueries({ queryKey: ["notes"] });
                queryClient.invalidateQueries({ queryKey: ["note"] });
              } else if (isItemsTexts) {
                queryClient.invalidateQueries({ queryKey: ["texts"] });
                queryClient.invalidateQueries({ queryKey: ["text"] });
              } else if (isItemsLists) {
                queryClient.invalidateQueries({ queryKey: ["topic-lists"] });
              } else {
                queryClient.invalidateQueries({ queryKey: ["cards"] });
                queryClient.invalidateQueries({ queryKey: ["card"] });
              }

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
