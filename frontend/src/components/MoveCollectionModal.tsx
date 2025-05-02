import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Modal from "./Modal";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import Button from "./Button";
import useCardActions from "../hooks/useCardActions";
import { CardType } from "../hooks/useGetCards";
import CollectionSkeleton from "./CollectionsSkeleton";
import useGetCollections, { CollectionType } from "@/hooks/useGetCollections";
import useModalStates from "@/hooks/useModalsStates";
import useInvalidateCollectionsQueries from "@/hooks/Queries/useInvalidateCollectionsQuery";
import { twMerge } from "tailwind-merge";
import useInfiniteScroll from "@/components/InfiniteScroll";
import InfiniteScroll from "@/components/InfiniteScroll";
import useGetSectionCollections from "@/hooks/useGetSectionCollections";

//! make sure to replace every collections.find to work with the new structure

const MoveCollectionModal = ({
  cards,
  text,
  sectionId,
}: {
  cards?: CardType[];
  text?: boolean;
  sectionId?: string;
}) => {
  const [selectedCollectionsIds, setSelectedCollectionIds] = useState<string[]>(
    []
  );
  const [referenceCollectionIds, setReferenceCollectionIds] = useState<
    string[]
  >([]);

  const {
    isMoveToCollectionOpen,
    setIsMoveToCollectionOpen,
    editId,
    toMoveCollection,
    setParentCollectionId,
    selectedItems,
    setSelectedItems,
    isCollectionModalOpen,
    setToMoveCollection,
    setIsCollectionModalOpen,
    setDefaultValues,
  } = useModalStates();

  const toMoveCollectionId = toMoveCollection?._id || "";
  const { collections, isLoading, fetchNextPage, hasNextPage } =
    useGetSectionCollections({
      sectionId: sectionId as string,
      enabled: isMoveToCollectionOpen && Boolean(sectionId),
    });

  const invalidateCollectionsQueries = useInvalidateCollectionsQueries();

  let lastSelectedCollectionId =
    selectedCollectionsIds[selectedCollectionsIds.length - 1];

  const { data: selectedCollection, isLoading: collectionLoading } = useQuery({
    queryKey: ["collection", lastSelectedCollectionId || "root"],
    enabled: Boolean(lastSelectedCollectionId), // disable this query from automatically running
    queryFn: () =>
      axios
        .get("collection/" + lastSelectedCollectionId)
        .then((res) => res.data as CollectionType),
  });

  //!this is the function that makes the modal open on the collection
  useEffect(() => {
    console.log(selectedCollection);
    if (!isMoveToCollectionOpen) return;
    if (selectedCollection === null) return;

    if (toMoveCollection) {
      if (
        collections?.find((collection) => collection._id === toMoveCollectionId)
      )
        return;

      setSelectedCollectionIds([
        toMoveCollection?.parentCollectionId as string,
      ]);
    } else {
      const card = cards?.find((card) => card._id === editId);
      let cardCollectionId = card?.collectionId;
      if (
        collections?.find((collection) => collection._id === cardCollectionId)
      )
        return;

      console.log(
        selectedCollection,
        collections,
        cardCollectionId,
        collections?.find((collection) => collection._id === cardCollectionId)
      );
      console.log("ran");
      setSelectedCollectionIds([cardCollectionId as string]);
    }

    // queryClient.invalidateQueries({ queryKey: ["collections"] });
    // if (!isMoveToCollectionOpen || !cards) return;
    // if (!toMoveCollectionId) {
    //   const card = cards.find((card) => card._id === editId);
    //   let cardCollectionId;
    //   let cardCollection = collections?.find(
    //     (collection) => collection._id === cardCollectionId
    //   );
    //   const getParentCollection = (childCollection: CollectionType) => {
    //     setSelectedCollectionIds((prev) => [...prev, childCollection._id]);
    //     const parentCollection = collections?.find(
    //       (collection) => collection._id === childCollection.parentCollectionId
    //     );
    //     if (!parentCollection) return;
    //     if (parentCollection?.parentCollectionId) {
    //       getParentCollection(parentCollection);
    //     }
    //   };
    //   if (cardCollection?.parentCollectionId) {
    //     getParentCollection(cardCollection);
    //     setSelectedCollectionIds((prev) => {
    //       let editPrev = prev.reverse();
    //       setReferenceCollectionIds(editPrev);
    //       return editPrev;
    //     });
    //   }
    // } else {
    //   const getParentCollection = (childCollection: CollectionType) => {
    //     setSelectedCollectionIds((prev) => [...prev, childCollection._id]);
    //     const parentCollection = collections?.find(
    //       (collection) => collection._id === childCollection.parentCollectionId
    //     );
    //     if (!parentCollection) return;
    //     if (parentCollection?.parentCollectionId) {
    //       getParentCollection(parentCollection);
    //     }
    //   };
    //   const toMoveCollection = collections?.find(
    //     (collection) => collection._id === toMoveCollectionId
    //   );
    //   if (toMoveCollection) {
    //     getParentCollection(toMoveCollection);
    //     setSelectedCollectionIds((prev) => {
    //       const topParentCollectionId = collections?.find(
    //         (collection) =>
    //           collection._id ===
    //           collections?.find((c) => c._id === prev[prev.length - 1])
    //             ?.parentCollectionId
    //       )?._id;
    //       if (topParentCollectionId) {
    //         let editPrev = [...prev, topParentCollectionId].reverse();
    //         setReferenceCollectionIds(editPrev);
    //         return editPrev;
    //       } else {
    //         return prev;
    //       }
    //     });
    //   }
    // }
  }, [isMoveToCollectionOpen]);

  useEffect(() => {
    if (!selectedCollection) return;
    // if (toMoveCollection) {
    if (
      selectedCollectionsIds.includes(
        selectedCollection?.parentCollectionId as string
      )
    )
      return;

    setSelectedCollectionIds((prev) => {
      return [selectedCollection.parentCollectionId as string, ...prev];
    });
    // }
  }, [selectedCollection]);

  useEffect(() => {
    console.log(selectedCollectionsIds);
    if (lastSelectedCollectionId) {
      setParentCollectionId(lastSelectedCollectionId);
    }
  }, [selectedCollectionsIds]);

  //!this is the function that gets the parent collection id of the collection to move to prevent moving it to the parent

  let currentCollectionParentId = useMemo(() => {
    let toMoveCollection = collections?.find((c) => {
      return c._id === toMoveCollectionId;
    });

    if (!toMoveCollection?.parentCollectionId) return false;
    return collections?.find(
      (c) => c._id === toMoveCollection.parentCollectionId
    )?._id;
  }, [toMoveCollectionId]);

  //!this is the function that prevents moving the parent to the deep children

  const childrenCollectionsArray = useMemo(() => {
    const toMoveCollection = collections?.find(
      (collection) => collection._id === toMoveCollectionId
    );
    let arr: string[] = [];

    const getCollectionChildren = (collection: CollectionType) => {
      const childCollectionId = collection.childCollectionId;
      const childCollection = collections?.find(
        (c) => c._id === childCollectionId
      );
      if (childCollection) {
        arr.push(childCollection._id);
        if (childCollection?.childCollectionId) {
          getCollectionChildren(childCollection);
        }
      }
    };
    if (toMoveCollection) getCollectionChildren(toMoveCollection);

    return arr;
  }, [isMoveToCollectionOpen, toMoveCollectionId]);

  const { updateCardHandler } = useCardActions();
  const states = useModalStates();

  const moveCollectionsHandler = ({
    root = false,
    targetCollectionId,
  }: {
    root?: boolean;
    targetCollectionId: string;
  }) => {
    if (selectedItems.length) {
      axios
        .post(
          "collection/batch-move",

          {
            ids: selectedItems,
            parentCollectionId: root ? null : targetCollectionId,
          }
        )
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: ["collections"],
          });
          queryClient.invalidateQueries({
            queryKey: ["collection"],
          });

          setSelectedItems?.([]);
        });
    } else {
      axios
        .patch(`collection/${toMoveCollectionId}`, {
          parentCollectionId: targetCollectionId,
        })
        .then((res) => {
          invalidateCollectionsQueries();
        })
        .catch((err) => err);
    }
    states.setIsMoveToCollectionOpen(false);
  };

  const moveCardsHandler = async ({
    root = false,
    targetCollectionId,
  }: {
    root?: boolean;
    targetCollectionId: string;
  }) => {
    if (selectedItems.length) {
      await axios.post("card/batch-move", {
        ids: selectedItems,
        collectionId: root ? null : targetCollectionId,
      });
    } else {
      await axios.patch("card/" + editId, {
        collectionId: root ? null : targetCollectionId,
      });
    }
    setSelectedItems?.([]);
    setDefaultValues((pre) => {
      return { ...pre, collectionId: targetCollectionId };
    });
    states.setIsMoveToCollectionOpen(false);
  };

  const queryClient = useQueryClient();

  const openCollectionModal = useCallback(
    () => setIsCollectionModalOpen(true),
    []
  );

  //! find if this needs to be refactored
  const moving = useMemo(() => {
    return collections?.find((c) => c._id === selectedItems[0])?._id
      ? "collections"
      : "cards";
  }, [selectedCollectionsIds]);

  const onAnimationEnd = useCallback(() => {
    setSelectedCollectionIds([]);
    // setEditId("");
    setToMoveCollection(undefined);
    setParentCollectionId("");
  }, [setSelectedCollectionIds, setParentCollectionId]);

  return (
    <Modal
      id={"moveCollectionModal"}
      onAnimationEnd={onAnimationEnd}
      className={`max-w-lg  z-[3000] w-full bg-white rounded-xl shadow-lg ${
        isCollectionModalOpen ? "opacity-0 pointer-events-none" : ""}`}
      isOpen={isMoveToCollectionOpen}
      setIsOpen={setIsMoveToCollectionOpen}
    >
      <div className="pt-3">
        <Modal.Header
          title={"Move To Collection"}
          setIsOpen={setIsMoveToCollectionOpen}
          openCollectionModal={openCollectionModal}
        />
        <div className="p-4 mb-6 bg-gray-50 rounded-xl border border-gray-100">
          <h6 className="mb-2 text-sm font-medium text-gray-600">
            Card Collection
          </h6>
          <p className="text-lg font-medium text-gray-800">
            {/* //! does this need edit ? */}
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
                .patch(`collection/${toMoveCollectionId}`, {
                  parentCollectionId: null,
                })
                .then((res) => {
                  invalidateCollectionsQueries();
                  setIsMoveToCollectionOpen(false);
                })
                .catch((err) => err);
            }}
          >
            Move To Root Collections
          </Button>
        ) : text ? (
          <Button
            className="px-4 py-1.5 mb-6 w-full text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            onClick={() => {
              setDefaultValues({ defaultCollectionId: null });
            }}
          >
            No Default Collection
          </Button>
        ) : (
          <Button
            className="px-4 py-1.5 mb-6 w-full text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            onClick={async () => {
              if (selectedItems.length) {
                await axios.post(`card/batch-move`, {
                  ids: selectedItems,
                  collectionId: null,
                });
              } else {
                await axios
                  .patch(`card/${editId}`, {
                    collectionId: null,
                  })
                  .catch((err) => err);
              }
              queryClient.invalidateQueries({ queryKey: ["cards"] });
              setIsMoveToCollectionOpen(false);
            }}
          >
            Remove From Collections
          </Button>
        )}

        <div className="relative">
          {
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
              {collectionLoading ? (
                <CollectionSkeleton />
              ) : (
                <InfiniteScroll
                  fetchNextPage={fetchNextPage}
                  hasNextPage={hasNextPage}
                >
                  {(selectedCollection?.subCollections || collections)?.map(
                    (collection) => {
                      const isParentCollection =
                        collection?.subCollections?.length;
                      {
                        /* //! does this need edit ? */
                      }

                      const isInputDisabled = () => {
                        let disabled;

                        if (toMoveCollectionId) {
                          // prevent moving child to parent
                          disabled =
                            collections?.find(
                              (c) => c._id === toMoveCollectionId
                            )?.parentCollectionId === collection._id ||
                            //prevent moving to it self
                            collection?._id === toMoveCollectionId;

                          //  [p1 , c1 , to move c2 , c3 , c4]
                          if (
                            selectedCollectionsIds.includes(toMoveCollectionId)
                          ) {
                            const toMoveCollectionIndex =
                              selectedCollectionsIds.indexOf(
                                toMoveCollectionId
                              );

                            const targetCollectionIndex =
                              selectedCollectionsIds.indexOf(collection._id);

                            const targetParentCollectionIndex =
                              selectedCollectionsIds.indexOf(
                                selectedCollection?._id as string
                              );

                            disabled =
                              toMoveCollectionIndex < targetCollectionIndex ||
                              toMoveCollectionIndex <
                                targetParentCollectionIndex ||
                              toMoveCollectionId ===
                                selectedCollectionsIds[
                                  selectedCollectionsIds.length - 1
                                ];
                          }
                        } else {
                          const cardCollectionId = cards?.find(
                            (card) => card._id === editId
                          )?.collectionId;

                          disabled = cardCollectionId === collection?._id;
                        }

                        return disabled;
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
                          className={twMerge(
                            `
                flex justify-between items-center p-3  cursor-pointer 
                transition-colors duration-200 ease-in-out border-b border-light-gray
                 `,
                            referenceCollectionIds.includes(collection?._id)
                              ? "bg-yellow-50"
                              : "bg-white  hover:bg-gray-50"
                          )}
                        >
                          <span className="flex flex-1 gap-3 items-center">
                            <p className="font-medium text-gray-700 transition-colors hover:text-gray-900">
                              {collection?.name}
                            </p>
                            {isParentCollection ? (
                              <MdOutlineKeyboardArrowRight className="text-2xl text-gray-400 group-hover:text-gray-600" />
                            ) : null}
                          </span>
                          {text ? (
                            <Button
                              onClick={(e: any) => {
                                e.stopPropagation();
                                setDefaultValues((pre) => {
                                  return {
                                    ...pre,
                                    defaultCollectionId: collection._id,
                                  };
                                });
                                setIsMoveToCollectionOpen(false);
                              }}
                              className="px-4 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              Select{" "}
                            </Button>
                          ) : (
                            <Button
                              disabled={isInputDisabled()}
                              onClick={(e: any) => {
                                e.stopPropagation();
                                !toMoveCollectionId
                                  ? moveCardsHandler({
                                      targetCollectionId: collection._id,
                                    })
                                  : moveCollectionsHandler({
                                      targetCollectionId: collection._id,
                                    });
                              }}
                              className="px-4 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              Move
                            </Button>
                          )}
                        </div>
                      );
                    }
                  )}
                </InfiniteScroll>
              )}
              {isLoading ? <CollectionSkeleton /> : null}
            </>
          }
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(MoveCollectionModal);
