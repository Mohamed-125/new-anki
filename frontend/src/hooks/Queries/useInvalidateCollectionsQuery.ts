import { useQueryClient } from "@tanstack/react-query";

const useInvalidateCollectionsQueries = () => {
  const queryClient = useQueryClient();

  const invalidateCollectionsQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["collections"] });
    queryClient.invalidateQueries({ queryKey: ["collection"] });
  };

  return invalidateCollectionsQueries;
};

export default useInvalidateCollectionsQueries;
