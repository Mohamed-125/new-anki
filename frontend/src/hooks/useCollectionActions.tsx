import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CollectionType } from "./useGetCollections";
import useToasts from "./useToasts";
import useInvalidateCollectionsQueries from "./Queries/useInvalidateCollectionsQuery";
import { useGetSelectedLearningLanguage } from "@/context/SelectedLearningLanguageContext";

const useCollectionActions = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToasts();
  const invalidateCollectionsQueries = useInvalidateCollectionsQueries();
  const { selectedLearningLanguage } = useGetSelectedLearningLanguage();

  // Update collection mutation with optimistic updates
  const updateCollectionMutation = useMutation({
    mutationFn: async ({
      id,
      name,
      isPublic,
      showCardsInHome,
      sectionId,
    }: {
      id: string;
      name: string;
      isPublic: boolean;
      showCardsInHome: boolean;
      sectionId?: string;
    }) => {
      const response = await axios.patch(`collection/${id}`, {
        name,
        public: isPublic,
        showCardsInHome,
        language: selectedLearningLanguage,
        sectionId,
      });
      return response.data;
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["collections"] });
      await queryClient.cancelQueries({ queryKey: ["collection"] });

      // Get the current query cache
      const previousCollections = queryClient.getQueryData(["collections"]);

      // Optimistically update the cache
      queryClient.setQueryData(["collections"], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => {
            return {
              ...page,
              collections: page.collections.map(
                (collection: CollectionType) => {
                  if (collection._id === variables.id) {
                    return {
                      ...collection,
                      name: variables.name,
                      public: variables.isPublic,
                      showCardsInHome: variables.showCardsInHome,
                      sectionId: variables.sectionId || collection.sectionId,
                    };
                  }
                  return collection;
                }
              ),
            };
          }),
        };
      });

      // Also update the individual collection query if it exists
      const previousCollection = queryClient.getQueryData([
        "collection",
        variables.id,
      ]);
      if (previousCollection) {
        queryClient.setQueryData(["collection", variables.id], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            name: variables.name,
            public: variables.isPublic,
            showCardsInHome: variables.showCardsInHome,
            sectionId: variables.sectionId || old.sectionId,
          };
        });
      }

      // Return a context with the previous collections
      return { previousCollections, previousCollection, toast: addToast };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context we saved to roll back
      if (context?.previousCollections) {
        queryClient.setQueryData(["collections"], context.previousCollections);
      }
      if (context?.previousCollection) {
        queryClient.setQueryData(
          ["collection", variables.id],
          context.previousCollection
        );
      }
      // Show error toast
    },
    onSuccess: (data, variables) => {
      // Invalidate collections queries to refetch fresh data
      invalidateCollectionsQueries();
      // Show success toast
      addToast("Collection updated successfully", "success");
    },
  });

  // Delete collection mutation with optimistic updates
  const deleteCollectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`collection/${id}`);
      return response.data;
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["collections"] });
      await queryClient.cancelQueries({ queryKey: ["collection"] });

      // Get the current query cache
      const previousCollections = queryClient.getQueryData(["collections"]);

      // Optimistically update the cache by removing the collection
      queryClient.setQueryData(["collections"], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => {
            return {
              ...page,
              collections: page.collections.filter(
                (collection: CollectionType) => collection._id !== id
              ),
            };
          }),
        };
      });

      // Return a context with the previous collections
      return { previousCollections, toast: addToast };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context we saved to roll back
      if (context?.previousCollections) {
        queryClient.setQueryData(["collections"], context.previousCollections);
      }
      // Show error toast
      addToast("Failed to delete collection", "error");
    },
    onSuccess: () => {
      // Invalidate collections queries to refetch fresh data
      invalidateCollectionsQueries();
      // Show success toast
      addToast("Collection deleted successfully", "success");
    },
  });

  // Fork collection mutation with optimistic updates
  const forkCollectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post(`collection/fork/${id}`);
      return response.data;
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["collections"] });

      // Get the current query cache
      const previousCollections = queryClient.getQueryData(["collections"]);

      // Return a context with the previous collections
      return { previousCollections, toast: addToast };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context we saved to roll back
      if (context?.previousCollections) {
        queryClient.setQueryData(["collections"], context.previousCollections);
      }
      // Show error toast
      addToast("Failed to fork collection", "error");
    },
    onSuccess: () => {
      // Invalidate collections queries to refetch fresh data
      invalidateCollectionsQueries();
      // Show success toast
      addToast("Collection forked successfully", "success");
    },
  });

  // Update collection handler
  const updateCollectionHandler = ({
    id,
    name,
    isPublic,
    showCardsInHome,
    sectionId,
  }: {
    id: string;
    name: string;
    isPublic: boolean;
    showCardsInHome: boolean;
    sectionId?: string;
  }) => {
    return updateCollectionMutation.mutateAsync({
      id,
      name,
      isPublic,
      showCardsInHome,
      sectionId,
    });
  };

  // Delete collection handler
  const deleteCollectionHandler = (id: string) => {
    return deleteCollectionMutation.mutateAsync(id);
  };

  // Fork collection handler
  const forkCollectionHandler = (id: string) => {
    return forkCollectionMutation.mutateAsync(id);
  };

  // Create collection mutation with optimistic updates
  const createCollectionMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      parentCollectionId?: string;
      public: boolean;
      showCardsInHome: boolean;
      language: string;
      sectionId?: string | null;
    }) => {
      const response = await axios.post("collection", data);
      return response.data;
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["collections"] });

      // Get the current query cache
      const previousCollections = queryClient.getQueryData(["collections"]);

      // Create an optimistic collection
      const optimisticCollection: CollectionType = {
        _id: `temp-${Date.now()}`,
        name: variables.name,
        parentCollectionId: variables.parentCollectionId || null,
        public: variables.public,
        showCardsInHome: variables.showCardsInHome,
        language: variables.language,
        sectionId: variables.sectionId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: "", // This will be filled by the server
      };

      // Optimistically update the cache
      queryClient.setQueryData(["collections"], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any, i: number) => {
            // Add the optimistic collection to the first page
            if (i === 0) {
              return {
                ...page,
                collections: [optimisticCollection, ...page.collections],
              };
            }
            return page;
          }),
        };
      });

      return {
        previousCollections,
        toast: addToast,
      };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context we saved to roll back
      if (context?.previousCollections) {
        queryClient.setQueryData(["collections"], context.previousCollections);
      }
      // Show error toast
      addToast("Failed to create collection", "error");
    },
    onSuccess: () => {
      // Invalidate collections queries to refetch fresh data
      invalidateCollectionsQueries();
      // Show success toast
      addToast("Collection created successfully", "success");
    },
  });

  // Create collection handler
  const createCollectionHandler = (data: {
    name: string;
    parentCollectionId?: string;
    public: boolean;
    showCardsInHome: boolean;
    sectionId?: string | null;
  }) => {
    return createCollectionMutation.mutateAsync({
      ...data,
      language: selectedLearningLanguage,
    });
  };

  return {
    updateCollectionHandler,
    deleteCollectionHandler,
    createCollectionHandler,
    forkCollectionHandler,
  };
};

export default useCollectionActions;
