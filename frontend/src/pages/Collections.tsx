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

const Collections = () => {
  const { setIsCollectionModalOpen, selectedItems } = useModalStates();
  useAddModalShortcuts(setIsCollectionModalOpen);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  const { collections, isLoading, collectionsCount } = useGetCollections({
    query: debouncedQuery,
  });

  console.log(collections, isLoading);
  return (
    <div className="container px-6 py-8 mx-auto max-w-7xl">
      <MoveCollectionModal />
      <AddNewCollectionModal />
      {selectedItems.length > 0 && (
        <SelectedItemsController isItemsCollections={true} />
      )}
      <div className="space-y-6">
        <div className="flex flex-col gap-4 justify-between items-start sm:flex-row sm:items-center">
          <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col gap-4 justify-between items-start mt-4 sm:flex-row sm:items-center">
            <Search
              searchingFor="collections"
              query={query}
              setQuery={setQuery}
            />
            <h6 className="text-sm font-medium text-gray-500">
              {collectionsCount} collections
            </h6>
          </div>
        </div>
        <Button
          className="flex ml-auto items-center gap-2 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          onClick={() => setIsCollectionModalOpen(true)}
        >
          <span className="text-xl">+</span>
          Create new collection
        </Button>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-2 sm:grid-cols-1">
          {collections?.map((collection) => (
            <Collection collection={collection} key={collection._id} />
          ))}
          {isLoading && <CollectionSkeleton />}
        </div>
      </div>
    </div>
  );
};

export default Collections;
