import Collection from "../components/Collection";
import { useState } from "react";
import Button from "../components/Button";
import Search from "../components/Search";
import SelectedItemsController from "../components/SelectedItemsController";
import useAddModalShortcuts from "../hooks/useAddModalShortcuts";
import AddNewCollectionModal from "../components/AddNewCollectionModal";
import useGetCollections from "../hooks/useGetCollections";
import MoveCollectionModal from "@/components/MoveCollectionModal";
import useModalStates from "@/hooks/useModalsStates";
import CollectionSkeleton from "@/components/CollectionsSkeleton";
import useDebounce from "@/hooks/useDebounce";
import ShareModal from "@/components/ShareModal";
import InfiniteScroll from "@/components/InfiniteScroll";

const Collections = () => {
  const { setIsCollectionModalOpen, selectedItems } = useModalStates();
  useAddModalShortcuts(setIsCollectionModalOpen);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  const {
    collections,
    isLoading,
    collectionsCount,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useGetCollections({
    query: debouncedQuery,
  });

  console.log(collections, isLoading);
  return (
    <div className="container px-6 py-8 mx-auto max-w-7xl">
      <MoveCollectionModal />
      <AddNewCollectionModal />
      <ShareModal sharing="collections" />
      {selectedItems.length > 0 && (
        <SelectedItemsController isItemsCollections={true} />
      )}
      <div className="space-y-6">
        <div className="flex gap-4 justify-between items-center my-4 sm:flex-row sm:items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="text-gray-500">({collectionsCount})</span>{" "}
            Collections
          </h1>
          <div className="flex-1 max-w-md">
            <Search
              searchingFor="collections"
              query={query}
              setQuery={setQuery}
            />
          </div>
          <Button
            className="flex items-center gap-2 px-4 py-2.5 text-white bg-[#5a3aa5] hover:bg-[#4a2a95] rounded-lg transition-colors shadow-sm"
            onClick={() => setIsCollectionModalOpen(true)}
          >
            <span className="text-xl">+</span>
            Create collection
          </Button>
        </div>

        <InfiniteScroll
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          className=""
        >
          {collections?.map((collection) => (
            <Collection collection={collection} key={collection._id} />
          ))}
          {isLoading && <CollectionSkeleton />}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default Collections;
