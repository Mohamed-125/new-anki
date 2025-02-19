import React from "react";
import Button from "./Button";
import axios from "axios";
import { TextType } from "../pages/MyTexts";

type SelectedItemsControllerProps = {
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  setChangeItemsParent?: React.Dispatch<React.SetStateAction<boolean>>;
  isItemsVideos?: boolean;
  isItemsCollections?: boolean;
  isItemsPlaylists?: boolean;
  isItemsNotes?: boolean;
  isItemsTexts?: boolean;
  setItemsState?: React.Dispatch<React.SetStateAction<any>>;
};

const SelectedItemsController = ({
  selectedItems,
  setSelectedItems,
  isItemsVideos,
  isItemsCollections,
  isItemsPlaylists,
  setChangeItemsParent,
  isItemsNotes,
  isItemsTexts,
  setItemsState,
}: SelectedItemsControllerProps) => {
  return selectedItems.length ? (
    <div className="flex items-center gap-3 px-4 py-4 my-5 bg-white border rounded-xl border-neutral-200">
      <p>Selected Items : {selectedItems?.length}</p>
      <Button
        onClick={() => {
          setSelectedItems([]);
        }}
      >
        Unselect All Items
      </Button>
      <Button
        variant={"danger"}
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

            // Call the API to delete the selected items

            await axios.post(url, { ids: selectedItems }); // Pass the item IDs in the request body for DELETE
            setItemsState?.((pre: string[]) =>
              //@ts-ignore
              pre.filter((item: TextType) => selectedItems.includes(item._id))
            );
            setSelectedItems([]);
          }
        }}
      >
        Delete Selected Items
      </Button>
      {setChangeItemsParent && (
        <Button
          onClick={() => {
            setChangeItemsParent(true);
          }}
        >
          {isItemsVideos ? "Move to playlist" : "Move to collection"}
        </Button>
      )}
    </div>
  ) : null;
};

export default SelectedItemsController;
