import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Card from "../components/Card";
import axios from "axios";
import Loading from "../components/Loading";
import Button from "../components/Button";
import AddCardModal from "../components/AddCardModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SelectedItemsController from "../components/SelectedItemsController";
import ChangeItemsParent from "../components/ChangeItemsParent.tsx";
import useGetCards, { CardType } from "../hooks/useGetCards.tsx";
import Search from "../components/Search.tsx";
import useGetCurrentUser from "../hooks/useGetCurrentUser.tsx";
import AddNewCollectionModal from "../components/AddNewCollectionModal.tsx";
import Collection from "../components/Collection.tsx";
import MoveCollectionModal from "../components/MoveCollectionModal.tsx";
import { CollectionType } from "../context/CollectionsContext.tsx";
import useInfiniteScroll from "@/hooks/useInfiniteScroll.tsx";
import CardsSkeleton from "@/components/CardsSkeleton.tsx";
import SearchCards from "@/components/SearchCards.tsx";

const CollectionPage = ({}) => {
  const location = useLocation();
  const pathArray = location.pathname.split("/").filter(Boolean); // Split and remove empty segments
  const id = pathArray[pathArray.length - 1]; // Get the last segment
  const { user } = useGetCurrentUser();

  const {
    data: collection,
    isLoading: collectionLoading,
    isError,
  } = useQuery({
    queryKey: ["collection", id],
    queryFn: () =>
      axios.get("collection/" + id).then((res) => res.data as CollectionType),
  });

  const {
    cardsCount,
    fetchNextPage,
    isIntialLoading,
    isFetchingNextPage,
    userCards: collectionCards,
  } = useGetCards({
    enabled: Boolean(collection?._id),
    collectionId: collection?._id,
  });

  console.log("collectionCards", collectionCards);
  const {} = useInfiniteScroll(fetchNextPage);

  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState({});
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState("");
  const [query, setQuery] = useState("");
  const [isMoveToCollectionOpen, setIsMoveToCollectionOpen] = useState(false);
  const [toMoveCollectionId, setToMoveCollectionId] = useState("");
  const [parentCollectionId, setParentCollectionId] = useState<string>("");
  const isLoading = collectionLoading;
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const deleteCollectionHandler = (collectionId: string) => {
    axios
      .delete(`collection/${collectionId}`)
      .then((res) => {
        queryClient.invalidateQueries({ queryKey: ["collections"] });
        queryClient.invalidateQueries({ queryKey: ["collection", id] });
      })
      .catch((err) => err);
  };

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

  console.log(moving);
  if (isLoading) {
    return <Loading />;
  }

  console.log(parentCollectionId);
  return (
    <div className="">
      <div className="">
        {collectionCards && (
          <>
            <AddNewCollectionModal
              setIsCollectionModalOpen={setIsCollectionModalOpen}
              isCollectionModalOpen={isCollectionModalOpen}
              defaultValues={defaultValues}
              editId={editId}
              parentCollectionId={parentCollectionId === "home" ? "" : id}
            />
            <MoveCollectionModal
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              setEditId={setEditId}
              toMoveCollectionId={toMoveCollectionId}
              isMoveToCollectionOpen={isMoveToCollectionOpen}
              setIsMoveToCollectionOpen={setIsMoveToCollectionOpen}
              editId={editId}
              isCollectionModalOpen={isCollectionModalOpen}
              setisCollectionModalOpen={setIsCollectionModalOpen}
              cards={collectionCards}
              setParentCollectionId={setParentCollectionId}
              // moving={moving}
            />

            <AddCardModal
              isMoveToCollectionOpen={isMoveToCollectionOpen}
              setIsMoveToCollectionOpen={setIsMoveToCollectionOpen}
              collectionId={collection?._id}
              isAddCardModalOpen={isAddCardModalOpen}
              setIsAddCardModalOpen={setIsAddCardModalOpen}
              defaultValues={defaultValues}
              content={content}
              setDefaultValues={setDefaultValues}
              setContent={setContent}
              editId={editId}
              setEditId={setEditId}
            />
          </>
        )}

        {/* <ChangeItemsParent
          changeItemsParent={changeItemsParent}
          setChangeItemsParent={setChangeItemsParent}
          itemsType={"card"}
          itemsIds={selectedItems}
          parentName="collection"
        /> */}

        <div className="py-8 min-h-screen">
          <div className="mt-6 space-y-6">
            <div className="space-y-8">
              <div className="bg-white rounded-xl mx-auto py-9 !w-[90%]">
                <div className="container">
                  {/* Header Section */}
                  <div className="flex flex-col gap-4 pb-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <h1 className="text-3xl font-bold text-gray-800">
                        {collection?.name}
                      </h1>
                      {user?._id === collection?.userId && (
                        <div className="flex gap-3">
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
                            className="flex gap-2 items-center px-4 py-2 text-white rounded-lg transition-all"
                            onClick={() => {
                              setDefaultValues({ collectionId: id });
                              setIsAddCardModalOpen(true);
                            }}
                          >
                            <span>+</span> Add Card
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Search Section */}
                  <div className="rounded-lg white">
                    {/* <Search
                      label="Search cards"
                      filter="front"
                    /> */}
                    <SearchCards query={query} setQuery={setQuery} />
                  </div>
                  {/* Sub Collections Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-medium text-gray-700">
                        Sub Collections
                        <span className="ml-2 px-2 py-0.5 text-sm bg-gray-100 text-gray-600 rounded-full">
                          {collection?.subCollections?.length || 0}
                        </span>
                      </h2>
                      <Button
                        className="flex gap-2 items-center px-4 py-2 text-white rounded-lg transition-all"
                        onClick={() => {
                          setDefaultValues({ parentCollectionId: id });
                          setIsCollectionModalOpen(true);
                        }}
                      >
                        <span>+</span> New Sub Collection
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 md:grid-cols-2 sm:grid-cols-1">
                      {collection?.subCollections.map(
                        (collection: CollectionType) => (
                          <Collection
                            setIsMoveToCollectionOpen={
                              setIsMoveToCollectionOpen
                            }
                            setToMoveCollectionId={setToMoveCollectionId}
                            collection={collection}
                            key={collection._id}
                            setDefaultValues={setDefaultValues}
                            setIsCollectionModalOpen={setIsCollectionModalOpen}
                            selectedItems={selectedItems}
                            setSelectedItems={setSelectedItems}
                            setEditId={setEditId}
                          />
                        )
                      )}
                    </div>
                  </div>{" "}
                </div>
              </div>
              {/* Cards Section */}
              <div className="container space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-medium text-gray-700">
                    Cards
                    <span className="ml-2 px-2 py-0.5 text-sm bg-gray-100 text-gray-600 rounded-full">
                      {cardsCount || 0}
                    </span>
                  </h2>
                </div>

                {selectedItems.length > 0 && (
                  <SelectedItemsController
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                    isItemsCards={moving === "cards" && true}
                    isItemsCollections={moving === "collections" && true}
                    moving={moving}
                    setIsMoveToCollectionOpen={setIsMoveToCollectionOpen}
                  />
                )}

                {isIntialLoading && <CardsSkeleton />}
                {collectionCards?.length ? (
                  <div className="">
                    {collectionCards?.map((card) => (
                      <Card
                        setIsMoveToCollectionOpen={setIsMoveToCollectionOpen}
                        setIsModalOpen={setIsAddCardModalOpen}
                        key={card._id}
                        card={card}
                        setContent={setContent}
                        setDefaultValues={setDefaultValues}
                        id={card._id}
                        setSelectedItems={setSelectedItems}
                        setIsAddCardModalOpen={setIsAddCardModalOpen}
                        selectedItems={selectedItems}
                        setEditId={setEditId}
                        isSameUser={user?._id === collection?.userId}
                        collectionId={collection?._id}
                      />
                    ))}
                    {isFetchingNextPage && <CardsSkeleton />}
                  </div>
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
    </div>
  );
};

export default CollectionPage;
