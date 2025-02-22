import { useContext } from "react";
import { collectionsContext } from "../context/CollectionsContext";
import useGetCollections from "./useGetCollections";

const useGetCollectionsContext = () => {
  const context = useContext(collectionsContext);
  if (!context) {
    throw new Error(
      "collectionsContext must be used within a CollectionsProvider"
    );
  }
  return context;
};

export default useGetCollectionsContext;
