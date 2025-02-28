import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CollectionType } from "./useGetCollections";

const useGetCollectionById = (id?: string) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["collection", id],
    enabled: Boolean(id),

    queryFn: () =>
      axios.get("collection/" + id).then((res) => res.data as CollectionType),
  });

  console.log("getting collection by id ran");
  return { data, isLoading };
};

export default useGetCollectionById;
