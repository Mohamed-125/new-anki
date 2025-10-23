import React, { useCallback, useMemo } from "react";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import { MdDriveFileMove } from "react-icons/md";
import { useQueryClient } from "@tanstack/react-query";
import useModalStates from "@/hooks/useModalsStates";
import { useNetwork } from "@/context/NetworkStatusContext";
import useDb from "@/db/useDb";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import useToasts from "../hooks/useToasts";

// Define item types for better type safety
export type ItemType =
  | "videos"
  | "collections"
  | "playlists"
  | "notes"
  | "texts"
  | "cards"
  | "lists";

type SelectedItemsControllerProps = {
  itemType?: ItemType;
  moving?: string;
  setMoveVideoModal?: React.Dispatch<React.SetStateAction<boolean>>;
  allItems?: string[];
  onSelectionChange?: (selectedItems: string[]) => void;
};

const SelectedItemsController = ({
  itemType = "cards",
  moving,
  setMoveVideoModal,
  allItems = [],
  onSelectionChange,
}: SelectedItemsControllerProps) => {
  const { selectedItems, setSelectedItems, setIsMoveToCollectionOpen } =
    useModalStates();
  const queryClient = useQueryClient();
  const { isOnline } = useNetwork();
  const { user , selectedLearningLanguage} = useGetCurrentUser();
  const { batchDeleteCards, handleOfflineOperation } = useDb(user?._id);

  // Map item types to their API endpoints and query keys
  const itemConfig = useMemo(
    () => ({
      videos: {
        endpoint: "video/batch-delete",
        queryKeys: ["videos", "video"],
        moveText: "Move to Playlist",
      },
      collections: {
        endpoint: "collection/batch-delete",
        queryKeys: ["collections", "collection"],
        moveText: "Move to Collection",
      },
      playlists: {
        endpoint: "playlist/batch-delete",
        queryKeys: ["playlists", "playlist"],
        moveText: "Move to Collection",
      },
      notes: {
        endpoint: "note/batch-delete",
        queryKeys: ["notes", "note"],
        moveText: "Move to Collection",
      },
      texts: {
        endpoint: "text/batch-delete",
        queryKeys: ["texts", "text"],
        moveText: "Move to Collection",
      },
      cards: {
        endpoint: "card/batch-delete",
        queryKeys: ["cards", "card"],
        moveText: "Move to Collection",
      },
      lists: {
        endpoint: "list/batch-delete",
        queryKeys: ["topic-lists"],
        moveText: "Move to Collection",
      },
    }),
    []
  );

  // Determine if move button should be shown
  const showMoveButton = useMemo(() => {
    return (
      itemType === "cards" ||
      itemType === "collections" ||
      itemType === "videos" ||
      moving === "cards" ||
      moving === "collections"
    );
  }, [itemType, moving]);

  // Get the current item configuration
  const currentConfig = useMemo(() => {
    // If moving is specified, use that as the item type
    const effectiveType = moving || itemType;
    return itemConfig[effectiveType as ItemType];
  }, [itemConfig, itemType, moving]);

  // Handle select/deselect all
  const handleSelectAll = useCallback(() => {
    const newSelection =
      selectedItems.length === allItems.length ? [] : [...allItems];
    setSelectedItems(newSelection);
    onSelectionChange?.(newSelection);
  }, [allItems, selectedItems, setSelectedItems, onSelectionChange]);

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedItems([]);
    onSelectionChange?.([]);
  }, [setSelectedItems, onSelectionChange]);

  // Handle move items
  const handleMoveItems = useCallback(() => {
    setIsMoveToCollectionOpen(true);
    setMoveVideoModal?.(true);
  }, [setIsMoveToCollectionOpen, setMoveVideoModal]);

  const { addToast } = useToasts();
  const handleDeleteItems = useCallback(async () => {
    if (!selectedItems.length || !currentConfig) return;

    const confirmation = window.confirm(
      "Are you sure you want to delete all selected items?"
    );

    if (!confirmation) return;

    try {
      if (isOnline) {
        // 🟢 Online: delete on server, then update local Dexie
        await axios.post(currentConfig.endpoint, { ids: selectedItems });

        if (itemType === "cards" && user?._id) {
          await batchDeleteCards(selectedItems);
        }

        // Invalidate queries to refetch fresh data
        currentConfig.queryKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key, user?._id, selectedLearningLanguage] });
        });

        addToast("Items deleted successfully");
      } else {
        // 🔴 Offline: update Dexie + cache manually
        if (itemType === "cards" && user?._id) {
          await batchDeleteCards(selectedItems);
          await handleOfflineOperation("batch_delete", { ids: selectedItems });

          // 🧩 Properly update React Query cache
          queryClient.setQueryData(["cards", user?._id, selectedLearningLanguage], (oldData: any) => {
            if (!oldData) return oldData;

            // Works for both infinite & normal query
            if (oldData.pages) {
              return {
                ...oldData,
                pages: oldData.pages.map((page: any) => ({
                  ...page,
                  cards: page.cards.filter(
                    (card: any) => !selectedItems.includes(card._id)
                  ),
                  cardsCount: page.cardsCount - selectedItems.length,
                })),
              };
            }

           

            return oldData;
          });

          addToast("Items deleted (offline mode)");
        }
      }

      // 🧹 Clear selected items
      setSelectedItems([]);
      onSelectionChange?.([]);
    } catch (error) {
      console.error("Error deleting items:", error);
      addToast("Failed to delete items");
    }
  }, [
    selectedItems,
    currentConfig,
    isOnline,
    itemType,
    user,
    batchDeleteCards,
    handleOfflineOperation,
    queryClient,
    setSelectedItems,
    onSelectionChange,
    addToast,
  ]);

  // Don't render if no items are selected
  if (!selectedItems.length) return null;

  return (
    <div className="flex fixed right-0 bottom-0 left-0 z-50 gap-4 justify-between items-center px-6 py-4 w-full bg-white bg-opacity-90 border-t shadow-lg backdrop-blur-sm border-neutral-200">
      <div className="flex gap-3 items-center">
        <button
          onClick={handleClearSelection}
          className="flex gap-2 items-center text-xl text-gray-600 transition-colors hover:text-gray-900"
          aria-label="Clear selection"
        >
          <IoClose />
        </button>

        <span className="text-lg font-semibold text-primary">
          {selectedItems.length} {selectedItems.length === 1 ? "item" : "items"}
        </span>

        <span className="text-gray-400">|</span>

        {allItems.length > 0 && (
          <button
            onClick={handleSelectAll}
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
        {showMoveButton && (
          <button
            className="flex gap-2 items-center transition-colors text-primary hover:text-primary/80"
            onClick={handleMoveItems}
          >
            <MdDriveFileMove className="text-3xl" />
            <span>{currentConfig?.moveText}</span>
          </button>
        )}

        <button
          className="flex gap-2 items-center text-red-500 transition-colors hover:text-red-600"
          onClick={handleDeleteItems}
        >
          <FaTrash className="text-xl" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default SelectedItemsController;
