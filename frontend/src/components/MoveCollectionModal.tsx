import React, { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import useGetCollectionsContext from "../hooks/useGetCollectionsContext";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { all } from "axios";
import { CollectionType } from "../context/CollectionsContext";
import Loading from "./Loading";
import { FaArrowLeft } from "react-icons/fa";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import Button from "./Button";
import useCardActions from "../hooks/useCardActions";
import { CardType } from "../hooks/useGetCards";
import { url } from "inspector";
import CollectionSkeleton from "./CollectionsSkeleton";

type MoveCollectionModalProps = {
  editId: string;
  setEditId: React.Dispatch<React.SetStateAction<string>>;
  isMoveToCollectionOpen: boolean;
  setIsMoveToCollectionOpen: React.Dispatch<React.SetStateAction<boolean>>;
  cards?: CardType[];
  toMoveCollectionId?: string;
  setTargetCollectionId?: React.Dispatch<React.SetStateAction<string>>;
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  selectedItems: string[];
  setisCollectionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCollectionModalOpen: boolean;
  setParentCollectionId: React.Dispatch<React.SetStateAction<string>>;
};

const MoveCollectionModal = ({
  editId,
  setEditId,
  cards,
  toMoveCollectionId,
  isMoveToCollectionOpen,
  setIsMoveToCollectionOpen,
  setTargetCollectionId,
  selectedItems,
  setSelectedItems,
  setisCollectionModalOpen,
  isCollectionModalOpen,
  setParentCollectionId,
}: MoveCollectionModalProps) => {
  const { collections, parentCollections, notParentCollections, isLoading } =
    useGetCollectionsContext();
  const [selectedCollectionsIds, setSelectedCollectionIds] = useState<string[]>(
    []
  );
  useEffect(() => {
    if (!isMoveToCollectionOpen || !cards) return;

    const card = cards.find((card) => card._id === editId);
    let cardCollectionId = card?.collectionId;
    let cardCollection = collections?.find(
      (collection) => collection._id === cardCollectionId
    );

    const getParentCollection = (childCollection: CollectionType) => {
      setSelectedCollectionIds((prev) => [...prev, childCollection._id]);

      const parentCollection = collections?.find(
        (collection) => collection._id === childCollection.parentCollectionId
      );

      if (!parentCollection) return;

      if (parentCollection?.parentCollectionId) {
        getParentCollection(parentCollection);
      }
    };

    if (cardCollection?.parentCollectionId) {
      getParentCollection(cardCollection);
      setSelectedCollectionIds((prev) => {
        let editPrev = prev.reverse();
        editPrev = prev.slice(0, -1);
        return editPrev;
      });
    }
  }, [isMoveToCollectionOpen]);

  let lastSelectedCollectionId =
    selectedCollectionsIds[selectedCollectionsIds.length - 1];

  const { data: selectedCollection, isLoading: collectionLoading } = useQuery({
    queryKey: ["collection", lastSelectedCollectionId],
    enabled: Boolean(lastSelectedCollectionId), // disable this query from automatically running
    queryFn: () =>
      axios
        .get("collection/" + lastSelectedCollectionId)
        .then((res) => res.data as CollectionType),
  });

  useEffect(() => {
    if (lastSelectedCollectionId) {
      console.log("lastSelectedCollectionId", lastSelectedCollectionId);
      setParentCollectionId(lastSelectedCollectionId);
    }
  }, [selectedCollectionsIds]);

  let currentCollectionParentId = useMemo(() => {
    let toMoveCollection = collections?.find((c) => {
      return c._id === toMoveCollectionId;
    });

    if (!toMoveCollection?.parentCollectionId) return false;
    return collections?.find(
      (c) => c._id === toMoveCollection.parentCollectionId
    )?._id;
  }, [toMoveCollectionId]);
  const queryClient = useQueryClient();

  const openCollectionModal = useCallback(
    () => setisCollectionModalOpen(true),
    []
  );

  return (
    <Modal
      onAnimationEnd={() => {
        setSelectedCollectionIds([]);
        setEditId("");
        setParentCollectionId("");
      }}
      className={`max-w-2xl w-full ${
        isCollectionModalOpen ? "opacity-0 pointer-events-none" : ""
      }`}
      isOpen={isMoveToCollectionOpen}
      setIsOpen={setIsMoveToCollectionOpen}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            Move To Collection
          </h3>
          <Button
            onClick={openCollectionModal}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <span className="text-xl">+</span>
          </Button>
        </div>

        <div className="p-4 mb-6 bg-gray-50 rounded-lg">
          <h6 className="mb-2 text-sm font-medium text-gray-600">
            Current Collection
          </h6>
          <p className="text-lg text-gray-800">
            {toMoveCollectionId
              ? collections?.find((c) => c._id === currentCollectionParentId)
                  ?.name || "No Collection"
              : cards
              ? collections?.find(
                  (collection) =>
                    collection._id ===
                    cards?.find((card) => card._id === editId)?.collectionId
                )?.name
              : "No Collection"}
          </p>
        </div>
        {toMoveCollectionId && (
          <Button
            className="py-2 mb-6 w-full"
            onClick={() => {
              axios
                .put(`collection/${toMoveCollectionId}`, {
                  parentCollectionId: null,
                })
                .then((res) => {
                  queryClient.invalidateQueries({ queryKey: ["collections"] });
                  queryClient.invalidateQueries({ queryKey: ["collection"] });
                })
                .catch((err) => err);
            }}
          >
            Move To Root Collections
          </Button>
        )}

        <div className="relative">
          {collectionLoading || isLoading ? (
            <CollectionSkeleton />
          ) : (
            <>
              {lastSelectedCollectionId && (
                <div className="flex gap-3 items-center p-3 mb-4 bg-gray-50 rounded-lg">
                  <button
                    className="p-2 text-gray-600 rounded-full transition-colors hover:bg-gray-200"
                    onClick={() =>
                      setSelectedCollectionIds((pre) => pre.slice(0, -1))
                    }
                  >
                    <FaArrowLeft className="text-xl" />
                  </button>
                  <h4 className="text-lg font-medium text-gray-800">
                    {selectedCollection?.name}
                  </h4>
                </div>
              )}
              {(
                selectedCollection?.subCollections || notParentCollections
              )?.map((collection) => {
                return (
                  <CollectionOption
                    // moving={moving}
                    setTargetCollectionId={setTargetCollectionId}
                    collections={collections}
                    toMoveCollectionId={toMoveCollectionId}
                    parentCollections={parentCollections}
                    key={collection._id} // Ensures React can efficiently update the DOM
                    setSelectedCollectionIds={setSelectedCollectionIds}
                    collection={collection}
                    queryClient={queryClient}
                    editId={editId}
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                    cards={cards}
                    setIsMoveToCollectionOpen={setIsMoveToCollectionOpen}
                  />
                );
              })}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(MoveCollectionModal);

const CollectionOption = React.memo(function CollectionOption({
  collection,
  setSelectedCollectionIds,
  setIsMoveToCollectionOpen,
  editId,
  cards,
  parentCollections,
  toMoveCollectionId,
  queryClient,
  collections,
  setTargetCollectionId,
  selectedItems,
  setSelectedItems,
}: {
  collection: CollectionType;
  setSelectedCollectionIds: React.Dispatch<React.SetStateAction<string[]>>;
  setIsMoveToCollectionOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editId: string;
  cards?: CardType[] | undefined;
  parentCollections: CollectionType[] | undefined;
  toMoveCollectionId?: string | undefined;
  collections?: CollectionType[];
  queryClient: QueryClient;
  setTargetCollectionId?: React.Dispatch<React.SetStateAction<string>>;
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  {
    const { updateCardHandler } = useCardActions();

    const isParentCollection = parentCollections?.find(
      (parentCollection) => parentCollection._id === collection?._id
    );

    let disabled = toMoveCollectionId
      ? collections?.find((c) => c._id === toMoveCollectionId)
          ?.parentCollectionId === collection._id ||
        collection?.parentCollectionId === toMoveCollectionId ||
        collection?._id === toMoveCollectionId
      : cards?.find((card) => card._id === editId)?.collectionId ===
        collection?._id;

    const moveHandler = () => {
      if (!toMoveCollectionId) {
        if (selectedItems.length) {
          axios
            .post(
              "card/batch-move",

              {
                ids: selectedItems,
                selectedParent: collection._id,
              }
            )
            .then(() => {
              queryClient.invalidateQueries({
                queryKey: ["collections"],
              });
              queryClient.invalidateQueries({
                queryKey: ["collection"],
              });
              queryClient.refetchQueries({ queryKey: ["collections"] });
              queryClient.refetchQueries({
                queryKey: ["collection"],
              });
              setSelectedItems?.([]);
            });
        }
        if (editId) {
          updateCardHandler(
            undefined,
            undefined,
            undefined,
            editId,
            collection?._id,
            undefined,
            undefined
          );
        } else {
          setTargetCollectionId?.(collection._id);
        }
      } else {
        axios
          .put(`collection/${toMoveCollectionId}`, {
            parentCollectionId: collection._id,
          })
          .then((res) => {
            queryClient.invalidateQueries({ queryKey: ["collections"] });
            queryClient.invalidateQueries({
              queryKey: ["collection"],
            });
            queryClient.refetchQueries({ queryKey: ["collections"] });
            queryClient.refetchQueries({
              queryKey: ["collection"],
            });
          })
          .catch((err) => err);
      }
      setIsMoveToCollectionOpen(false);
    };

    return (
      <div
        key={collection?._id}
        id={collection?._id}
        onClick={() => {
          if (isParentCollection) {
            setSelectedCollectionIds((pre) => [
              ...pre,
              collection?._id as string,
            ]);
          }
        }}
        className={`
        flex justify-between items-center p-3 rounded-lg
        ${isParentCollection ? "cursor-pointer hover:bg-gray-100" : ""}
        transition-colors duration-200
        ${disabled ? "opacity-50" : ""}`}
      >
        <span className="flex flex-1 gap-3 items-center">
          <p className="font-medium text-gray-700">{collection?.name}</p>
          {isParentCollection && (
            <MdOutlineKeyboardArrowRight className="text-2xl text-gray-400" />
          )}
        </span>
        <Button disabled={disabled} onClick={moveHandler}>
          Move
        </Button>
      </div>
    );
  }
});
