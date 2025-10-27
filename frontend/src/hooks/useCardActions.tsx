import React, { SetStateAction } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CardType } from "./useGetCards";
import useToasts from "./useToasts";
import { useGetSelectedLearningLanguage } from "@/context/SelectedLearningLanguageContext";
import { useNetwork } from "@/context/NetworkStatusContext";
import useDb from "../db/useDb";
import useGetCurrentUser from "./useGetCurrentUser";

const useCardActions = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToasts();
  const { selectedLearningLanguage } = useGetSelectedLearningLanguage();
  const { isOnline } = useNetwork();
  const { user } = useGetCurrentUser();
  const { updateCard, deleteCard, handleOfflineOperation } = useDb(user?._id);
  const { mutateAsync: updateCardMutation } = useMutation({
    onMutate: async (updatedCard) => {
      const toast = addToast("Updating card...", "promise");

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["cards"] });

      // Get the current query cache
      const previousCards = queryClient.getQueryData([
        "cards",
        selectedLearningLanguage,
      ]);
      const previousCollectionCards = updatedCard.collectionId
        ? queryClient.getQueryData([
            "cards",
            updatedCard.collectionId,
            selectedLearningLanguage,
          ])
        : null;

      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: ["cards"] }, (old: any) => {
        if (!old) return old;

        // Update the card in the pages
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            cards: page.cards.map((card: CardType) =>
              card._id === updatedCard._id ? { ...card, ...updatedCard } : card
            ),
          })),
        };
      });

      return { toast, previousCards, previousCollectionCards };
    },
    onSuccess: async (d, data, context: any) => {
      // Invalidate all card queries to ensure updates are reflected everywhere
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      // Invalidate specific collection queries
      if (data.collectionId) {
        queryClient.invalidateQueries({
          queryKey: ["cards", user?._id, data.collectionId],
        });
      }
      context.toast.setToastData({
        title: "Card updated successfully!",
        isCompleted: true,
      });
    },
    onError: (error, variables, context: any) => {
      // Revert optimistic updates
      if (context.previousCards) {
        queryClient.setQueryData(
          ["cards", user?._id, selectedLearningLanguage],
          context.previousCards
        );
      }
      if (context.previousCollectionCards && variables.collectionId) {
        queryClient.setQueryData(
          [
            "cards",
            user?._id,
            variables.collectionId,
            selectedLearningLanguage,
          ],
          context.previousCollectionCards
        );
      }

      context.toast.setToastData({
        title: "Failed to update card",
        type: "error",
      });
    },
    mutationFn: async (data: CardType) => {
      await updateCard(data);

      console.log("isOnline in mutation", isOnline);
      if (!isOnline) {
        await handleOfflineOperation("update", data);
        return data;
      }
      return axios.patch(`/card/${data._id}`, data).then((res) => res.data);
    },
  });

  const updateCardHandler = async (
    e?: React.FormEvent<HTMLFormElement>,
    setIsAddCardModalOpen?: React.Dispatch<SetStateAction<boolean>>,
    content?: string,
    editId?: string,
    collectionId?: string,
    front?: string,
    back?: string
  ) => {
    e?.preventDefault();
    const formData = new FormData(e?.target as HTMLFormElement);

    try {
      const updatedCard = {
        content: content,
        //@ts-ignore
        front: (formData.get("card_word") as string) || front,
        //@ts-ignore
        back: (formData.get("card_translation") as string) || back,
        _id: editId || "",
        collectionId: collectionId,
        language: selectedLearningLanguage,
      };

      await updateCard(updatedCard);
      if (!isOnline) {
        await handleOfflineOperation("update", updatedCard);

        // Optimistically update the cache
        queryClient.setQueriesData({ queryKey: ["cards"] }, (old: any) => {
          if (!old) return old;

          // Update the card in the pages
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              cards: page.cards.map((card: CardType) =>
                card._id === updatedCard._id
                  ? { ...card, ...updatedCard }
                  : card
              ),
            })),
          };
        });

        setIsAddCardModalOpen?.(false);
        return;
      }

      const result = await updateCardMutation(updatedCard);
    } catch (err) {
      console.error("Error updating card:", err);
      addToast("Failed to update card", "error");
    }
  };

  const { mutateAsync: deleteCardMutation } = useMutation({
    onMutate: async ({ id, collectionId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["cards"] });

      // Get the current query cache
      const previousCards = queryClient.getQueryData([
        "cards",
        selectedLearningLanguage,
      ]);
      const previousCollectionCards = collectionId
        ? queryClient.getQueryData([
            "cards",
            collectionId,
            selectedLearningLanguage,
          ])
        : null;

      // Optimistically update the cache by removing the card
      queryClient.setQueriesData({ queryKey: ["cards"] }, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            cards: page.cards.filter((card: CardType) => card._id !== id),
          })),
        };
      });

      return { previousCards, previousCollectionCards };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      if (variables.collectionId) {
        queryClient.invalidateQueries({
          queryKey: ["cards", user?._id, variables.collectionId],
        });
      }
      addToast("Card Deleted Successfully", "success");
    },
    onError: (error, variables, context: any) => {
      // Revert optimistic updates
      if (context.previousCards) {
        queryClient.setQueryData(
          ["cards", user?._id, selectedLearningLanguage],
          context.previousCards
        );
      }
      if (context.previousCollectionCards && variables.collectionId) {
        queryClient.setQueryData(
          [
            "cards",
            user?._id,
            variables.collectionId,
            selectedLearningLanguage,
          ],
          context.previousCollectionCards
        );
      }

      addToast("Failed to delete the card", "error");
    },
    mutationFn: async ({
      id,
      collectionId,
    }: {
      id: string;
      collectionId?: string;
    }) => {
      return axios.delete(`/card/${id}`).then((res) => res.data);
    },
  });

  const deleteHandler = async (id: string, collectionId?: string) => {
    try {
      await deleteCard(id);
      if (!isOnline) {
        await handleOfflineOperation("delete", { _id: id, collectionId });
        // Optimistically update the cache by removing the card
        queryClient.setQueriesData({ queryKey: ["cards"] }, (old: any) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              cards: page.cards.filter((card: CardType) => card._id !== id),
              cardsCount: page?.cardsCount - 1,
            })),
          };
        });
        return { id };
      }
      await deleteCardMutation({ id, collectionId });
    } catch (error) {
      console.error("Error deleting card:", error);
      addToast("Failed to delete card", "error");
    }
  };

  const { mutateAsync: moveCardsMutation } = useMutation({
    onMutate: async ({ ids, collectionId }) => {
      const toast = addToast("Moving cards...", "promise");

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["cards"] });

      // Get the current query cache
      const previousCards = queryClient.getQueryData([
        "cards",
        selectedLearningLanguage,
      ]);
      const previousSourceCollectionCards =
        ids.length === 1
          ? queryClient.getQueryData([
              "cards",
              ids[0].collectionId,
              selectedLearningLanguage,
            ])
          : null;
      const previousTargetCollectionCards = collectionId
        ? queryClient.getQueryData([
            "cards",
            collectionId,
            selectedLearningLanguage,
          ])
        : null;

      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: ["cards"] }, (old: any) => {
        if (!old) return old;

        // Update the cards in the pages
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            cards: page.cards.map((card: CardType) =>
              ids.includes(card._id) ? { ...card, collectionId } : card
            ),
          })),
        };
      });

      return {
        toast,
        previousCards,
        previousSourceCollectionCards,
        previousTargetCollectionCards,
      };
    },
    onSuccess: async (d, { ids, collectionId }, context: any) => {
      // Invalidate all card queries to ensure updates are reflected everywhere
      queryClient.invalidateQueries({ queryKey: ["cards"] });

      context.toast.setToastData({
        title: "Cards moved successfully!",
        type: "success",
      });
    },
    onError: (error, variables, context: any) => {
      // Revert optimistic updates
      if (context.previousCards) {
        queryClient.setQueryData(
          ["cards", user?._id, selectedLearningLanguage],
          context.previousCards
        );
      }
      if (context.previousSourceCollectionCards) {
        queryClient.setQueryData(
          [
            "cards",
            user?._id,
            variables.ids[0].collectionId,
            selectedLearningLanguage,
          ],
          context.previousSourceCollectionCards
        );
      }
      if (context.previousTargetCollectionCards && variables.collectionId) {
        queryClient.setQueryData(
          [
            "cards",
            user?._id,
            variables.collectionId,
            selectedLearningLanguage,
          ],
          context.previousTargetCollectionCards
        );
      }

      context.toast.setToastData({
        title: "Failed to move cards",
        type: "error",
      });
    },
    mutationFn: async ({
      ids,
      collectionId,
    }: {
      ids: string[];
      collectionId: string | null;
    }) => {
      // Update local cards
      for (const id of ids) {
        await updateCard({ _id: id, collectionId } as CardType);
      }

      if (!isOnline) {
        await handleOfflineOperation("move", { ids, collectionId });
        return { ids, collectionId };
      }
      return axios
        .post("card/batch-move", {
          ids,
          collectionId,
        })
        .then((res) => res.data);
    },
  });

  const moveCardsHandler = async (
    ids: string[],
    collectionId: string | null
  ) => {
    try {
      await moveCardsMutation({ ids, collectionId });

      if (!isOnline) {
        addToast("Cards moved offline. Will sync when online.", "info");
      }
    } catch (error) {
      console.error("Error moving cards:", error);
      addToast("Failed to move cards", "error");
    }
  };

  const { mutateAsync: moveCardMutation } = useMutation({
    onMutate: async ({ id, collectionId }) => {
      const toast = addToast("Moving card...", "promise");

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["cards"] });

      // Get the current query cache
      const previousCards = queryClient.getQueryData([
        "cards",
        selectedLearningLanguage,
      ]);
      const previousSourceCollectionCards = queryClient.getQueryData([
        "cards",
        id.collectionId,
        selectedLearningLanguage,
      ]);
      const previousTargetCollectionCards = collectionId
        ? queryClient.getQueryData([
            "cards",
            collectionId,
            selectedLearningLanguage,
          ])
        : null;

      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: ["cards"] }, (old: any) => {
        if (!old) return old;

        // Update the card in the pages
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            cards: page.cards.map((card: CardType) =>
              card._id === id ? { ...card, collectionId } : card
            ),
          })),
        };
      });

      return {
        toast,
        previousCards,
        previousSourceCollectionCards,
        previousTargetCollectionCards,
      };
    },
    onSuccess: async (d, { id, collectionId }, context: any) => {
      // Invalidate all card queries to ensure updates are reflected everywhere
      queryClient.invalidateQueries({ queryKey: ["cards"] });

      context.toast.setToastData({
        title: "Card moved successfully!",
        type: "success",
      });
    },
    onError: (error, variables, context: any) => {
      // Revert optimistic updates
      if (context.previousCards) {
        queryClient.setQueryData(
          ["cards", user?._id, selectedLearningLanguage],
          context.previousCards
        );
      }
      if (context.previousSourceCollectionCards) {
        queryClient.setQueryData(
          [
            "cards",
            user?._id,
            variables.id.collectionId,
            selectedLearningLanguage,
          ],
          context.previousSourceCollectionCards
        );
      }
      if (context.previousTargetCollectionCards && variables.collectionId) {
        queryClient.setQueryData(
          [
            "cards",
            user?._id,
            variables.collectionId,
            selectedLearningLanguage,
          ],
          context.previousTargetCollectionCards
        );
      }

      context.toast.setToastData({
        title: "Failed to move card",
        type: "error",
      });
    },
    mutationFn: ({
      id,
      collectionId,
    }: {
      id: string;
      collectionId: string | null;
    }) => {
      return axios
        .patch("card/" + id, {
          collectionId,
        })
        .then((res) => res.data);
    },
  });

  const moveCardHandler = async (id: string, collectionId: string | null) => {
    try {
      await moveCardMutation({ id, collectionId });
    } catch (error) {
      console.error("Error moving card:", error);
    }
  };

  return {
    updateCardHandler,
    deleteHandler,
    moveCardsHandler,
    moveCardHandler,
  };
};

export default useCardActions;
