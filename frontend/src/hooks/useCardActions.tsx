import React, { SetStateAction } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CardType } from "./useGetCards";
import useToasts from "./useToasts";

const useCardActions = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToasts();

  const { mutateAsync: updateCardMutation } = useMutation({
    onMutate: async () => {
      const toast = addToast("Updating card...", "promise");
      return { toast };
    },
    onSuccess: async (d, data, context: any) => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      if (data.collectionId) {
        queryClient.invalidateQueries({
          queryKey: ["cards", data.collectionId],
        });
      }
      context.toast.setToastData({
        title: "Card updated successfully!",
        isCompleted: true,
      });
    },
    onError: (error, variables, context: any) => {
      context.toast.setToastData({
        title: "Failed to update card",
        type: "error",
      });
    },
    mutationFn: (data: CardType) => {
      return axios.patch(`/card/${data._id}`, data).then((res) => {
        return res.data;
      });
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
      await updateCardMutation({
        content: content,
        //@ts-ignore
        front: (formData.get("card_word") as string) || front,
        //@ts-ignore
        back: (formData.get("card_translation") as string) || back,
        _id: editId || "",
        collectionId: collectionId,
      }).then((res) => {
        setIsAddCardModalOpen?.(false);
        queryClient.invalidateQueries({ queryKey: ["cards"] });
      });
    } catch (err) {}
  };

  const deleteHandler = async (id: string, collectionId?: string) => {
    try {
      const res = await axios.delete(`/card/${id}`);
      addToast("Card Deleted Successfly", "success");
    } catch {
      addToast("Failed to delete the card ", "error");
    } finally {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    }
  };

  return { updateCardHandler, deleteHandler };
};

export default useCardActions;
