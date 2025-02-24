import React, { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { all } from "axios";
import Loading from "./Loading";
import { FaArrowLeft } from "react-icons/fa";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import Button from "./Button";
import useCardActions from "../hooks/useCardActions";
import { CardType } from "../hooks/useGetCards";
import { url } from "inspector";
import CollectionSkeleton from "./CollectionsSkeleton";
import useGetCollections, { CollectionType } from "@/hooks/useGetCollections";

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
    useGetCollections();
  const [selectedCollectionsIds, setSelectedCollectionIds] = useState<string[]>(
    []
  );
  useEffect(() => {
    if (!isMoveToCollectionOpen || !cards) return;

    const card = cards.find((card) => card._id === editId);

    console.log(card);
    let cardCollectionId = card?.collectionId;
    let cardCollection = collections?.find(
      (collection) => collection._id === cardCollectionId
    );

    console.log(cardCollection);
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
    console.log(selectedCollectionsIds);
    if (lastSelectedCollectionId) {
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

  const { updateCardHandler } = useCardActions();

  // const moveCollectionsHandler = (root = false) => {
  //   if (selectedItems.length) {
  //     axios
  //       .post(
  //         "collection/batch-move",

  //         {
  //           ids: selectedItems,
  //           parentCollectionId: targetCollectionId,
  //         }
  //       )
  //       .then(() => {
  //         queryClient.invalidateQueries({
  //           queryKey: ["collections"],
  //         });
  //         queryClient.invalidateQueries({
  //           queryKey: ["collection"],
  //         });

  //         setSelectedItems?.([]);
  //       });
  //   } else {
  //     axios
  //       .put(`collection/${toMoveCollectionId}`, {
  //         parentCollectionId: targetCollectionId,
  //       })
  //       .then((res) => {
  //         queryClient.invalidateQueries({ queryKey: ["collections"] });
  //         queryClient.invalidateQueries({
  //           queryKey: ["collection"],
  //         });
  //       })
  //       .catch((err) => err);
  //   }

  //   const moveCardsHandler = (root = false) => {
  //     if (selectedItems.length) {
  //       axios
  //         .post("card/batch-move", {
  //           ids: selectedItems,
  //           collectionId: root ? null : targetCollectionId,
  //         })
  //         .then(() => {
  //           queryClient.invalidateQueries({
  //             queryKey: ["cards"],
  //           });
  //           setSelectedItems?.([]);
  //         });
  //     } else {
  //       updateCardHandler(
  //         undefined,
  //         undefined,
  //         undefined,
  //         editId,
  //         targetCollectionId,
  //         undefined,
  //         undefined
  //       );
  //     }
  //   };

  //   useEffect(() => {
  //     if (targetCollectionId) {
  //       const collection = collections?.find(
  //         (c) =>
  //           c._id === editId ||
  //           toMoveCollectionId ||
  //           selectedCollectionsIds.includes(c._id)
  //       );

  //       console.log(collection);
  //     }
  //   }, [targetCollectionId]);

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
      className={`max-w-lg w-full bg-white rounded-xl shadow-lg ${
        isCollectionModalOpen ? "opacity-0 pointer-events-none" : ""
      }`}
      isOpen={isMoveToCollectionOpen}
      setIsOpen={setIsMoveToCollectionOpen}
    >
      <div className="pt-3 ">
        <Modal.Header
          title={"Move To Collection"}
          setIsOpen={setIsMoveToCollectionOpen}
          openCollectionModal={openCollectionModal}
        />

        <div className="p-4 mb-6 border border-gray-100 bg-gray-50 rounded-xl">
          <h6 className="mb-2 text-sm font-medium text-gray-600">
            Card Collection
          </h6>
          <p className="text-lg font-medium text-gray-800">
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
        {toMoveCollectionId ? (
          <Button
            className="px-4 py-1.5 mb-6 w-full text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            onClick={() => {
              axios
                .put(`collection/${toMoveCollectionId}`, {
                  parentCollectionId: null,
                })
                .then((res) => {
                  queryClient.invalidateQueries({ queryKey: ["collections"] });
                  queryClient.invalidateQueries({ queryKey: ["collection"] });
                  setIsMoveToCollectionOpen(false);
                })
                .catch((err) => err);
            }}
          >
            Move To Root Collections
          </Button>
        ) : (
          <Button
            className="px-4 py-1.5 mb-6 w-full text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            onClick={() => {
              axios
                .put(`card/${editId}`, {
                  collectionId: null,
                })
                .then((res) => {
                  queryClient.invalidateQueries({ queryKey: ["collections"] });
                  queryClient.invalidateQueries({ queryKey: ["collection"] });
                  setIsMoveToCollectionOpen(false);
                })
                .catch((err) => err);
            }}
          >
            Remove From Collections
          </Button>
        )}

        <div className="relative">
          {collectionLoading || isLoading ? (
            <CollectionSkeleton />
          ) : (
            <>
              {lastSelectedCollectionId && (
                <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-gray-50">
                  <button
                    className="p-2 text-gray-600 transition-colors rounded-full hover:bg-gray-200"
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
          setSelectedCollectionIds((pre) => [
            ...pre,
            collection?._id as string,
          ]);
        }}
        className={`
        flex justify-between items-center p-3  cursor-pointer hover:bg-gray-50 
        transition-colors duration-200 ease-in-out border-b border-light-gray
         `}
      >
        <span className="flex items-center flex-1 gap-3">
          <p className="font-medium text-gray-700 transition-colors hover:text-gray-900">
            {collection?.name}
          </p>
          {isParentCollection && (
            <MdOutlineKeyboardArrowRight className="text-2xl text-gray-400 group-hover:text-gray-600" />
          )}
        </span>
        <Button
          disabled={disabled}
          onClick={moveHandler}
          className="px-4 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          Move
        </Button>
      </div>
    );
  }
});
