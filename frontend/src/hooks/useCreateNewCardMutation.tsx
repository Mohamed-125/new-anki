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

const useCreateNewCard = ({ collectionId }: Params = {}) => {
  const queryClient = useQueryClient();
  const { addToast } = useToasts();
  const { selectedLearningLanguage } = useGetSelectedLearningLanguage();
  const { isOnline } = useNetwork();
  const { user } = useGetCurrentUser();
  const { mutateAsync, data, isPending } = useMutation({
    mutationFn: async (cardData: CardType) => {
      // Generate _id per card submission
      const cardWithId = { ...cardData };

      if (!isOnline) return;
      // Send to server
      const response = await axios.post("/card/", cardWithId);

      // Return card with frontend _id
      return { ...response.data };
    },

    onMutate: async (newCard: CardType) => {
      const toast = addToast("Creating card...", "promise");

      const optimisticCard: CardType = {
        ...newCard,

        stability: newCard.stability ?? 0,
        difficulty: newCard.difficulty ?? 0.3,
        elapsed_days: newCard.elapsed_days ?? 0,
        scheduled_days: newCard.scheduled_days ?? 0,
        learning_steps: newCard.learning_steps ?? 0,
        reps: newCard.reps ?? 0,
        lapses: newCard.lapses ?? 0,
        state: newCard.state ?? 0,
        last_review: newCard.last_review ?? new Date(),
        due: newCard.due ?? new Date(),
      };

      // Add to IndexedDB

      // Cancel any outgoing queries
      await queryClient.cancelQueries({
        queryKey: ["cards", user?._id, selectedLearningLanguage],
      });

      const previousCards = queryClient.getQueryData([
        "cards",
        selectedLearningLanguage,
      ]);

      // Optimistically update cache
      queryClient.setQueryData(
        ["cards", selectedLearningLanguage],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any, index: number) => {
              if (index === 0) {
                return {
                  ...page,
                  cards: [optimisticCard, ...page.cards],
                  cardsCount: (page.cardsCount || 0) + 1,
                };
              }
              return page;
            }),
          };
        }
      );

      return { previousCards, toast, optimisticCard };
    },

    onError: (error, variables, context: any) => {
      // Revert optimistic cache
      if (context?.previousCards) {
        queryClient.setQueryData(
          ["cards", selectedLearningLanguage],
          context.previousCards
        );
      }
      context?.toast?.setToastData({
        title: "Failed to create card",
        type: "error",
      });
    },

    onSuccess: (res, variables, context) => {
      // Invalidate queries to refetch actual data
      queryClient.invalidateQueries({
        queryKey: ["cards", user?._id, selectedLearningLanguage],
      });
      context?.toast?.setToastData({
        title: "Card created successfully!",
        isCompleted: true,
      });
    },
  });

  const { addCard, getCards, handleOfflineOperation } = useDb(user?._id);

  const fetchCards = async () => {
    const cards = await getCards();
    if (!cards) return;
    queryClient.setQueryData(
      ["cards", user?._id, selectedLearningLanguage],
      (old: any) => {
        if (!old || !old.pages?.length) {
          return {
            pages: [{ cards, cardsCount: cards.length, nextPage: undefined }],
            pageParams: [0],
          };
        }

        const updatedPages = [...old.pages];
        updatedPages[0] = {
          ...updatedPages[0],
          cards,
          cardsCount: cards.length,
        };

        return { ...old, pages: updatedPages };
      }
    );
  };

  const createCardHandler = async (
    e: React.FormEvent<HTMLFormElement> | null,
    additionalData: Partial<CardType> = {}
  ) => {
    e?.preventDefault();
    const formData = new FormData(e?.target as HTMLFormElement);
    const _id = nanoid();

    const cardData: CardType = {
      front: formData.get("card_word") as string,
      back: formData.get("card_translation") as string,
      language: selectedLearningLanguage,
      userId: user?._id,
      createdAt:new Date().toJSON(),
      _id,
      ...additionalData,
    };
    const optimisticCard: CardType = {
      ...cardData,

      stability: cardData.stability ?? 0,
      difficulty: cardData.difficulty ?? 0.3,
      elapsed_days: cardData.elapsed_days ?? 0,
      scheduled_days: cardData.scheduled_days ?? 0,
      learning_steps: cardData.learning_steps ?? 0,
      reps: cardData.reps ?? 0,
      lapses: cardData.lapses ?? 0,
      state: cardData.state ?? 0,
      last_review: cardData.last_review ?? new Date(),
      due: cardData.due ?? new Date(),
    };
    addCard(optimisticCard);

    if (!isOnline) {
      handleOfflineOperation("add", cardData);

      await fetchCards();
      return;
    } else {
      return mutateAsync(cardData);
    }
  };

  return { createCardHandler, data, isLoading: isPending };
};

export default useCreateNewCard;
