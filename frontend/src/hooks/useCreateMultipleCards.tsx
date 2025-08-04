import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CardType } from "./useGetCards";
import useToasts from "./useToasts";
import { useGetSelectedLearningLanguage } from "@/context/SelectedLearningLanguageContext";

type Params = {
  collectionId?: string;
};

const useCreateMultipleCards = ({ collectionId }: Params = {}) => {
  const queryClient = useQueryClient();
  const { addToast } = useToasts();
  const { selectedLearningLanguage } = useGetSelectedLearningLanguage();

  const { mutateAsync, data, isPending } = useMutation({
    onMutate: async (newCards) => {
      const toast = addToast("Creating cards...", "promise");
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["cards"] });
      
      // Get the current query cache
      const previousCards = queryClient.getQueryData(["cards", selectedLearningLanguage]);
      const previousCollectionCards = collectionId ? 
        queryClient.getQueryData(["cards", collectionId, selectedLearningLanguage]) : null;
      
      // Create optimistic cards with temporary IDs
      const optimisticCards = newCards.map((card: any, index: number) => ({
        ...card,
        _id: `temp-${Date.now()}-${index}`,
        id: `temp-${Date.now()}-${index}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      // Optimistically update the cache
      queryClient.setQueriesData(
        { queryKey: ["cards"] },
        (old: any) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map((page: any, index: number) => {
              // Add the new cards to the beginning of the first page
              if (index === 0) {
                return {
                  ...page,
                  cards: [...optimisticCards, ...page.cards],
                  cardsCount: (page.cardsCount || 0) + optimisticCards.length
                };
              }
              return page;
            })
          };
        }
      );
      
      return { previousCards, previousCollectionCards, toast, optimisticCards };
    },
    onError: (error, variables, context: any) => {
      // Revert optimistic updates
      if (context?.previousCards) {
        queryClient.setQueryData(["cards", selectedLearningLanguage], context.previousCards);
      }
      if (context?.previousCollectionCards && collectionId) {
        queryClient.setQueryData(
          ["cards", collectionId, selectedLearningLanguage], 
          context.previousCollectionCards
        );
      }
      
      context?.toast?.setToastData({
        title: "Failed to create cards",
        type: "error",
      });
    },
    onSuccess: async (res, variables, context) => {
      // Invalidate queries to refetch with the actual server data
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      if (collectionId) {
        queryClient.invalidateQueries({ queryKey: ["cards", collectionId] });
      }
      
      context?.toast?.setToastData({
        title: `${res.length} cards created successfully!`,
        isCompleted: true,
      });
    },
    mutationFn: (cards: any[]) => {
      return axios.post("/card/batch", { 
        cards: cards.map(card => ({
          ...card,
          language: selectedLearningLanguage
        }))
      }).then((res) => {
        return res.data;
      });
    },
  });

  const createMultipleCardsHandler = async (cards: any[]) => {
    return mutateAsync(cards);
  };

  return { createMultipleCardsHandler, data, isLoading: isPending };
};

export default useCreateMultipleCards;