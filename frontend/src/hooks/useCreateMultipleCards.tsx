import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { nanoid } from "nanoid";
import useDb from "../db/useDb";
import { CardType } from "@/hooks/useGetCards";
import useToasts from "./useToasts";
import { useGetSelectedLearningLanguage } from "@/context/SelectedLearningLanguageContext";
import { useNetwork } from "../context/NetworkStatusContext";
import useGetCurrentUser from "./useGetCurrentUser";

type Params = {
  collectionId?: string;
};

const useCreateMultipleCards = ({ collectionId }: Params = {}) => {
  const queryClient = useQueryClient();
  const { addToast } = useToasts();
  const { selectedLearningLanguage } = useGetSelectedLearningLanguage();
  const { isOnline } = useNetwork();
  const { user } = useGetCurrentUser();
  const { addCard, bulkAddCards, handleOfflineOperation, getCards } = useDb(
    user?._id
  );

  const { mutateAsync, data, isPending } = useMutation({
    mutationFn: async (cards: CardType[]) => {
      if (!isOnline) return;

      // Send cards to server
      const response = await axios.post("/card/batch", {
        cards: cards.map((card) => ({
          ...card,
          language: selectedLearningLanguage,
        })),
      });

      return response.data;
    },

    onMutate: async (newCards: CardType[]) => {
      const toast = addToast("Creating cards...", "promise");

      // Cancel ongoing queries
      await queryClient.cancelQueries({
        queryKey: ["cards", user?._id, selectedLearningLanguage],
      });

      const previousCards = queryClient.getQueryData([
        "cards",
        selectedLearningLanguage,
      ]);

      // Optimistic cards
      const optimisticCards = newCards;

      // Optimistically update general cards cache
      // queryClient.setQueryData(
      //   ["cards", user?._id, selectedLearningLanguage],
      //   (old: any) => {
      //     if (!old) return old;
      //     return {
      //       ...old,
      //       pages: old.pages.map((page: any, index: number) => {
      //         if (index === 0) {
      //           return {
      //             ...page,
      //             cards: [...optimisticCards, ...page.cards],
      //             cardsCount: (page.cardsCount || 0) + optimisticCards.length,
      //           };
      //         }
      //         return page;
      //       }),
      //     };
      //   }
      // );

      // Optimistically update collection cards cache for each collectionId
      const collectionGroups: { [key: string]: CardType[] } = {};
      for (const card of newCards) {
        if (card.collectionId) {
          if (!collectionGroups[card.collectionId]) {
            collectionGroups[card.collectionId] = [];
          }
          collectionGroups[card.collectionId].push(card);
        }
      }
      Object.entries(collectionGroups).forEach(([collectionId, cards]) => {
        queryClient.setQueryData(
          ["cards", user?._id, selectedLearningLanguage, collectionId],
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page: any, index: number) => {
                if (index === 0) {
                  return {
                    ...page,
                    cards: [...cards, ...page.cards],
                    cardsCount: (page.cardsCount || 0) + cards.length,
                  };
                }
                return page;
              }),
            };
          }
        );
      });

      return { previousCards, toast, optimisticCards };
    },

    onError: (error, variables, context: any) => {
      if (context?.previousCards) {
        queryClient.setQueryData(
          ["cards", user?._id, selectedLearningLanguage],
          context.previousCards
        );
      }

      context?.toast?.setToastData({
        title: "Failed to create cards",
        type: "error",
      });
    },

    onSuccess: async (res, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["cards", user?._id, selectedLearningLanguage],
      });
      // Also invalidate collections queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      context?.toast?.setToastData({
        title: `${res.length} cards created successfully!`,
        isCompleted: true,
      });
    },
  });

  const createMultipleCardsHandler = async (cards: Partial<CardType>[]) => {
    const preparedCards: CardType[] = cards.map((card) => ({
      ...card,
      _id: nanoid(),
      userId: user?._id,
      language: selectedLearningLanguage,
      collectionId,
      createdAt: new Date().toJSON(),
      updatedAt: new Date().toJSON(),
      stability: card.stability ?? 0,
      difficulty: card.difficulty ?? 0.3,
      elapsed_days: card.elapsed_days ?? 0,
      scheduled_days: card.scheduled_days ?? 0,
      learning_steps: card.learning_steps ?? 0,
      reps: card.reps ?? 0,
      lapses: card.lapses ?? 0,
      state: card.state ?? 0,
      last_review: card.last_review ?? new Date(),
      due: card.due ?? new Date(),
    }));
    if (preparedCards[0].showInHome) {
      // Add locally (Dexie)
      await bulkAddCards(preparedCards);

      queryClient.setQueryData(
        ["cards", user?._id, selectedLearningLanguage],
        (old: any) => {
          if (!old) return old;

          console.log("updating cache 222");
          return {
            ...old,
            pages: old.pages.map((page: any, index: number) => {
              if (index === 0) {
                return {
                  ...page,
                  cards: [...preparedCards, ...page.cards],
                  cardsCount: (page.cardsCount || 0) + preparedCards.length,
                };
              }
              return page;
            }),
          };
        }
      );

      if (!isOnline) {
        // Offline: queue operation
        handleOfflineOperation("add", { cards: preparedCards });
        return;
      }
    }

    // Online: sync with server
    return mutateAsync(preparedCards);
  };

  return { createMultipleCardsHandler, data, isLoading: isPending };
};

export default useCreateMultipleCards;
