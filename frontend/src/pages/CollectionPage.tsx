import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Card from "../components/Card";
import Loading from "../components/Loading";
import Button from "../components/Button";
import { Skeleton } from "@/components/ui/skeleton";
import AddCardModal from "../components/AddCardModal";
import { useQueryClient } from "@tanstack/react-query";
import SelectedItemsController from "../components/SelectedItemsController";
import useGetCards, { CardType } from "../hooks/useGetCards.tsx";
import useGetCurrentUser from "../hooks/useGetCurrentUser.tsx";
import AddNewCollectionModal from "../components/AddNewCollectionModal.tsx";
import Collection from "../components/Collection.tsx";
import MoveCollectionModal from "../components/MoveCollectionModal.tsx";
import { CollectionType } from "@/hooks/useGetCollections.tsx";
import CardsSkeleton from "@/components/CardsSkeleton.tsx";
import Search from "@/components/Search.tsx";
import useModalsStates from "@/hooks/useModalsStates.tsx";
import useGetCollectionById from "@/hooks/useGetCollectionById.tsx";
import InfiniteScroll from "@/components/InfiniteScroll.tsx";
import useToasts from "@/hooks/useToasts.tsx";
import ExportJsonModal from "@/components/ExportJsonModal";
import useCollectionActions from "@/hooks/useCollectionActions";

const CollectionPage = React.memo(function CollectionPage({}) {
  const location = useLocation();
  const pathArray = location.pathname.split("/").filter(Boolean); // Split and remove empty segments
  const id = pathArray[pathArray.length - 1]; // Get the last segment
  const { user } = useGetCurrentUser();

  const { collection, isLoading: isCollectionLoading } =
    useGetCollectionById(id);

  const {
    selectedItems,
    setDefaultValues,
    setIsCollectionModalOpen,
    setIsAddCardModalOpen,
    setParentCollectionId,
  } = useModalsStates();

  useEffect(() => {
    if (collection?._id) setParentCollectionId(collection._id);
  }, [collection]);

  const {
    cardsCount,
    fetchNextPage,
    isIntialLoading,
    isFetchingNextPage,
    hasNextPage,
    userCards: collectionCards,
  } = useGetCards({
    enabled: Boolean(collection?._id),
    collectionId: collection?._id,
  });
  const { deleteCollectionHandler, forkCollectionHandler } =
    useCollectionActions();

  const handleAddCard = useMemo(
    () => () => {
      setDefaultValues({ collectionId: id });
      setIsAddCardModalOpen(true);
    },
    [id, setDefaultValues, setIsAddCardModalOpen]
  );

  const handleAddSubCollection = useMemo(
    () => () => {
      setDefaultValues({ parentCollectionId: id });
      setIsCollectionModalOpen(true);
    },
    [id, setDefaultValues, setIsCollectionModalOpen]
  );

  const memoizedCards = useMemo(() => {
    return collectionCards?.map((card) => (
      <Card
        key={card._id}
        id={card._id}
        card={card}
        sectionId={location?.state?.sectionId}
        collectionId={collection?._id}
      />
    ));
  }, [collectionCards, collection?._id]);

  const memoizedSubCollections = useMemo(() => {
    return collection?.subCollections.map((collection: CollectionType) => (
      <Collection collection={collection} key={collection._id} />
    ));
  }, [collection?.subCollections]);

  const [query, setQuery] = useState("");

  const queryClient = useQueryClient();

  let moving = useMemo(() => {
    const isCollections = collection?.subCollections.find(
      (c) => c._id === selectedItems[0]
    );
    if (isCollections) {
      return "collections";
    } else {
      return "cards";
    }
  }, [selectedItems]);

  if (isCollectionLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 mb-8">
          <Skeleton className="w-1/3 h-8" />
          <Skeleton className="w-full h-12" />
        </div>
        <Skeleton className="mb-4 w-full h-16" />
        <CardsSkeleton />
      </div>
    );
  }

  const isSameUser =
    user?._id === collection?.userId ||
    (collection?.sectionId && user?.isAdmin);

  const { addToast } = useToasts();

  return (
    <div className="">
      <div className="">
        <>
          <MoveCollectionModal
            cards={collectionCards}
            // moving={moving}
          />
          <AddNewCollectionModal />
          <AddCardModal collectionId={collection?._id} />
          <ExportJsonModal />
        </>
        <SelectedItemsController
          allItems={collectionCards?.map((card) => card._id) || []}
          itemType={moving === "collections" ? "collections" : "cards"}
          moving={moving}
          // setMoveVideoModal={setMoveVideoModal}
        />
        {/* <ChangeItemsParent
          changeItemsParent={changeItemsParent}
          setChangeItemsParent={setChangeItemsParent}
          itemsType={"card"}
          itemsIds={selectedItems}
          parentName="collection"
        /> */}
        <div className="py-8 min-h-screen">
          <div className="space-y-8">
            <div className="container">
              {/* Header courseLevel */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start md:block">
                  <h1 className="text-3xl font-bold text-gray-800 md:mb-3">
                    {collection?.name}
                  </h1>

                  <div className="flex gap-3">
                    {isSameUser ? (
                      <>
                        <Button
                          variant="primary-outline"
                          className="flex gap-2 items-center hover:bg-blue-50"
                        >
                          <Link to={"/study-cards/" + id}>
                            <span className="flex gap-2 items-center">
                              📚 Study Now
                            </span>
                          </Link>
                        </Button>
                        <Button
                          variant="primary-outline"
                          className="flex gap-2 items-center hover:bg-blue-50"
                          onClick={async () => {
                            try {
                              const response = await fetch(
                                `/api/collections/${collection?._id}/cards`
                              );
                              if (!response.ok)
                                throw new Error("Failed to fetch cards");
                              const allCards = await response.json();

                              const cardsJson = {
                                cards: allCards.map((card) => ({
                                  front: card.front,
                                  back: card.back,
                                  content: card.content || "",
                                })),
                              };
                              const jsonStr = JSON.stringify(
                                cardsJson,
                                null,
                                2
                              );

                              await navigator.clipboard.writeText(jsonStr);
                              addToast(
                                "All cards JSON copied to clipboard!",
                                "success"
                              );
                            } catch (error) {
                              console.error("Error copying cards:", error);
                              // Show modal with JSON content for manual copying if available
                              if (collectionCards) {
                                const fallbackJson = {
                                  cards: collectionCards.map((card) => ({
                                    front: card.front,
                                    back: card.back,
                                    content: card.content || "",
                                  })),
                                };
                                setDefaultValues({
                                  exportJson: JSON.stringify(
                                    fallbackJson,
                                    null,
                                    2
                                  ),
                                  isExportModalOpen: true,
                                });
                              } else {
                                addToast("Failed to copy cards", "error");
                              }
                            }
                          }}
                        >
                          <span className="flex gap-2 items-center">
                            📋 Copy Cards JSON
                          </span>
                        </Button>
                        <Button
                          className="flex gap-2 items-center px-4 py-2 text-white rounded-lg transition-all"
                          onClick={() => {
                            setDefaultValues({
                              collectionId: id,
                              sectionId: collection?.sectionId,
                            });
                            setIsAddCardModalOpen(true);
                          }}
                        >
                          <span>+</span> Add Card
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        className="flex gap-2 items-center"
                        onClick={async () => {
                          const toast = addToast(
                            "Forking collection...",
                            "promise"
                          );
                          try {
                            await forkCollectionHandler(id);
                            toast.setToastData({
                              title: "Collection forked successfully!",
                              type: "success",
                            });
                          } catch (err) {
                            console.error("Error forking collection:", err);
                            toast.setToastData({
                              title: "Failed to fork collection",
                              type: "error",
                            });
                          }
                        }}
                      >
                        Add to your collections
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              {/* Search courseLevel */}
              <div className="mt-6 rounded-lg white">
                {/* <Search
                      label="Search cards"
                      filter="front"
                    /> */}
                <Search
                  searchingFor="Cards"
                  query={query}
                  setQuery={setQuery}
                />
              </div>
              {/* Sub Collections courseLevel */}
              <div className="mt-8">
                <div className="flex flex-wrap justify-between items-center mb-5">
                  <h2 className="text-xl font-medium text-gray-700">
                    Sub Collections
                    <span className="ml-2 px-2 py-0.5 text-sm bg-gray-100 mt-3 text-gray-600 rounded-full">
                      {collection?.subCollections?.length || 0}
                    </span>
                  </h2>
                  {isSameUser && (
                    <Button
                      className="flex gap-2 items-center px-4 py-2 text-white rounded-lg transition-all"
                      onClick={() => {
                        setDefaultValues({ parentCollectionId: id });
                        setIsCollectionModalOpen(true);
                      }}
                    >
                      <span>+</span> New Sub Collection
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 lg:grid-cols-2 md:grid-cols-1">
                  {memoizedSubCollections}
                </div>
              </div>{" "}
            </div>

            {/* Cards courseLevel */}
            <div className="container space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium text-gray-700">
                  Cards
                  <span className="ml-2 px-2 py-0.5 text-sm bg-gray-100 text-gray-600 rounded-full">
                    {cardsCount || 0}
                  </span>
                </h2>
              </div>

              {isIntialLoading ? (
                <CardsSkeleton cards={[]} />
              ) : collectionCards?.length > 0 ? (
                <InfiniteScroll
                  hasNextPage={hasNextPage}
                  loadingElement={<CardsSkeleton cards={collectionCards} />}
                  fetchNextPage={fetchNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                >
                  {memoizedCards}
                </InfiniteScroll>
              ) : (
                <div className="flex flex-col justify-center items-center py-16 bg-white rounded-lg border-gray-200 border-dashed mt-6border-2 ed-xl white">
                  <p className="mb-4 text-gray-500">
                    Start by adding your first card
                  </p>
                  {user?._id === collection?.userId && (
                    <Button
                      className="flex gap-2 items-center px-6 py-3 text-white rounded-lg transition-all"
                      onClick={() => {
                        setDefaultValues({ collectionId: id });
                        setIsAddCardModalOpen(true);
                      }}
                    >
                      <span>+</span> Create Card
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CollectionPage;
