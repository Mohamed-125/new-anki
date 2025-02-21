import React, { useEffect, useMemo, useState } from "react";
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

type MoveCollectionModalProps = {
  editId: string;
  setEditId: React.Dispatch<React.SetStateAction<string>>;
  isMoveToCollectionOpen: boolean;
  setIsMoveToCollectionOpen: React.Dispatch<React.SetStateAction<boolean>>;
  cards?: CardType[];
  toMoveCollectionId?: string;
  setTargetCollectionId: React.Dispatch<React.SetStateAction<string>>;
};

const MoveCollectionModal = ({
  editId,
  setEditId,
  cards,
  toMoveCollectionId,
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
        <h6 className="mb-2 text-lg font-semibold">
          Current collection:{" "}
          {toMoveCollectionId
            ? collections?.find((c) => c._id === currentCollectionParentId)
                ?.name || "No Collection"
            : cards
            ? collections?.find(
                (collection) =>
                  collection._id ===
                  cards?.find((card) => card._id === editId)?.collectionId
              )?.name
            : "No Collection"}{" "}
        </h6>
        {toMoveCollectionId && (
          <Button
            className="mt-1 mb-4"
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
            Move To Collections
          </Button>
        )}
        <div className="relative">
          {collectionLoading && <Loading />}
          {lastSelectedCollectionId && (
            <div className="flex gap-3 items-center my-6">
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
                  setTargetCollectionId={setTargetCollectionId}
                  collections={collections}
                  toMoveCollectionId={toMoveCollectionId}
                  parentCollections={parentCollections}
                  key={collection._id} // Ensures React can efficiently update the DOM
                  setSelectedCollectionIds={setSelectedCollectionIds}
                  collection={collection}
                  queryClient={queryClient}
                  editId={editId}
                  cards={cards}
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

export default React.memo(MoveCollectionModal);

const CollectionOption = ({
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
  setTargetCollectionId: React.Dispatch<React.SetStateAction<string>>;
}) => {
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

  return (
    <div
      key={collection?._id}
      id={collection?._id}
      style={{
        cursor: isParentCollection ? "pointer" : "default",
      }}
      className="flex justify-between items-center px-2 py-3 border-b-2 border-gray-300 hover:bg-gray-200"
    >
      <span
        className="flex flex-1 justify-between items-center"
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
        disabled={disabled}
        onClick={() => {
          if (!toMoveCollectionId) {
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
              setTargetCollectionId(collection._id);
            }
          } else {
            axios
              .put(`collection/${toMoveCollectionId}`, {
                parentCollectionId: collection._id,
              })
              .then((res) => {
                queryClient.invalidateQueries({ queryKey: ["collections"] });
              })
              .catch((err) => err);
          }
          setIsMoveToCollectionOpen(false);
        }}
      >
        Move
      </Button>
    </div>
  );
};
