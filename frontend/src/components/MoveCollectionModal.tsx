import React, { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import useGetCollectionsContext from "../hooks/useGetCollectionsContext";
import { useQuery } from "@tanstack/react-query";
import axios, { all } from "axios";
import { CollectionType } from "../context/CollectionsContext";
import Loading from "./Loading";
import { FaArrowLeft } from "react-icons/fa";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import Button from "./Button";
import useCardActions from "../hooks/useCardActions";
import { CardType } from "../hooks/useGetCards";

type MoveCollectionModalProps = {
  editId: string;
  setEditId: React.Dispatch<React.SetStateAction<string>>;
  cards: CardType[];
  isMoveToCollectionOpen: boolean;
  setTargetCollectionId?: React.Dispatch<React.SetStateAction<string>>;
  setIsMoveToCollectionOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const MoveCollectionModal = ({
  editId,
  setEditId,

  cards,
  isMoveToCollectionOpen,
  setIsMoveToCollectionOpen,
  setTargetCollectionId,
}: MoveCollectionModalProps) => {
  const { collections, parentCollections, notParentCollections } =
    useGetCollectionsContext();
  const [selectedCollectionsIds, setSelectedCollectionIds] = useState<string[]>(
    []
  );
  useEffect(() => {
    if (!isMoveToCollectionOpen) return;

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

  useEffect(() => {
    console.log(selectedCollectionsIds);
  }, [selectedCollectionsIds]);

  let lastSelectedCollectionId =
    selectedCollectionsIds[selectedCollectionsIds.length - 1];

  const {
    data: selectedCollection,
    isLoading: collectionLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["collection", lastSelectedCollectionId],
    refetchOnWindowFocus: false,
    enabled: false, // disable this query from automatically running
    queryFn: () =>
      axios
        .get("collection/" + lastSelectedCollectionId)
        .then((res) => res.data as CollectionType),
  });

  useEffect(() => {
    if (lastSelectedCollectionId) {
      refetch();
    }
  }, [selectedCollectionsIds]);

  return (
    <Modal
      onAnimationEnd={() => {
        setSelectedCollectionIds([]);
        setEditId("");
      }}
      isOpen={isMoveToCollectionOpen}
      setIsOpen={setIsMoveToCollectionOpen}
    >
      <div className="py-10">
        <h3 className="mb-4 text-2xl font-bold">Move To Collection</h3>
        <h6 className="mb-6 text-lg font-semibold ">
          Current collection:{" "}
          {collections?.find(
            (collection) =>
              collection._id ===
              cards?.find((card) => card._id === editId)?.collectionId
          )?.name || "No Collection"}{" "}
        </h6>
        <div className="relative">
          {collectionLoading && <Loading />}
          {lastSelectedCollectionId && (
            <div className="flex items-center gap-3 my-6">
              <button
                className="text-2xl text-gray-600"
                onClick={() =>
                  setSelectedCollectionIds((pre) => pre.slice(0, -1))
                }
              >
                <FaArrowLeft />
              </button>
              <h4 className="text-xl font-semibold text-gray-600">
                {selectedCollection?.name}
              </h4>
            </div>
          )}
          {(selectedCollection?.subCollections || notParentCollections)?.map(
            (collection) => {
              return (
                <CollectionOption
                  cards={cards}
                  parentCollections={parentCollections}
                  key={collection._id} // Ensures React can efficiently update the DOM
                  setSelectedCollectionIds={setSelectedCollectionIds}
                  collection={collection}
                  editId={editId}
                  setTargetCollectionId={setTargetCollectionId}
                  setIsMoveToCollectionOpen={setIsMoveToCollectionOpen}
                />
              );
            }
          )}{" "}
        </div>
      </div>
    </Modal>
  );
};

export default MoveCollectionModal;

const CollectionOption = ({
  collection,
  setSelectedCollectionIds,
  setIsMoveToCollectionOpen,
  editId,
  cards,
  parentCollections,
  setTargetCollectionId,
}: {
  collection: CollectionType | undefined;
  setSelectedCollectionIds: React.Dispatch<React.SetStateAction<string[]>>;
  setIsMoveToCollectionOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editId: string;
  setTargetCollectionId?: React.Dispatch<React.SetStateAction<string>>;
  cards: CardType[];
  parentCollections: CollectionType[] | undefined;
}) => {
  const { updateCardHandler } = useCardActions();

  const isParentCollection = parentCollections?.find(
    (parentCollection) => parentCollection._id === collection?._id
  );

  return (
    <div
      key={collection?._id}
      id={collection?._id}
      style={{
        cursor: isParentCollection ? "pointer" : "default",
      }}
      className="flex items-center justify-between px-2 py-3 border-b-2 border-gray-300 hover:bg-gray-200"
    >
      <span
        className="flex items-center justify-between flex-1 "
        onClick={() => {
          isParentCollection &&
            setSelectedCollectionIds((pre) => [
              ...pre,
              collection?._id as string,
            ]);
        }}
      >
        <p>{collection?.name}</p>
        {isParentCollection && (
          <button className="text-3xl">
            <MdOutlineKeyboardArrowRight />
          </button>
        )}
      </span>
      <Button
        disabled={
          cards?.find((card) => card._id === editId)?.collectionId ===
          collection?._id
        }
        onClick={() => {
          if (editId) {
            updateCardHandler(
              undefined,
              setIsMoveToCollectionOpen,
              undefined,
              editId,
              collection?._id,
              undefined,
              undefined
            );
          } else {
            setTargetCollectionId?.(collection?._id);
            setIsMoveToCollectionOpen(false);
          }
        }}
      >
        Move
      </Button>
    </div>
  );
};
