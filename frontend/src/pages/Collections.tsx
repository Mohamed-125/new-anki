import Collection from "../components/Collection";
import { useState, useMemo, useEffect } from "react";
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
import DeleteCollectionModal from "@/components/DeleteCollectionModal";
import useCollectionActions from "../hooks/useCollectionActions";
import useToasts from "../hooks/useToasts";

const Collections = () => {
  const { setIsCollectionModalOpen, selectedItems } = useModalStates();
  useAddModalShortcuts(setIsCollectionModalOpen);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);
  const { deleteCollectionHandler } = useCollectionActions();
  const { addToast } = useToasts();

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.id) {
        onDelete(e.detail.id, e.detail.deleteCards);
      }
    };
    window.addEventListener("confirmDeleteCollection", handler);
    return () => window.removeEventListener("confirmDeleteCollection", handler);
  }, []);

  const onDelete = async (id: string, deleteCards: boolean) => {
    const toast = addToast("Deleting collection...", "promise");
    try {
      await deleteCollectionHandler(id, deleteCards);
      toast.setToastData({
        title: "Collection deleted successfully",
        type: "success",
      });
    } catch (error) {
      toast.setToastData({
        title: "Failed to delete collection",
        type: "error",
      });
    }
  };

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

  // Extract all collection IDs for select all functionality
  const allCollectionIds = useMemo(() => {
    return collections?.map((collection) => collection._id) || [];
  }, [collections]);

  return (
    <div className="container px-6 py-8 mx-auto max-w-7xl">
      <DeleteCollectionModal />
      <MoveCollectionModal />
      <AddNewCollectionModal />
      <ShareModal sharing="collections" />
      <SelectedItemsController
        itemType="collections"
        allItems={allCollectionIds}
      />
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

        {isLoading ? (
          <CollectionSkeleton />
        ) : (
          <InfiniteScroll
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            className=""
            loadingElement={<CollectionSkeleton />}
          >
            {collections?.map((collection) => (
              <Collection collection={collection} key={collection._id} />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
};

export default Collections;
