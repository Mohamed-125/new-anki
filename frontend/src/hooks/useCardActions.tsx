import React, { SetStateAction } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CardType } from "./useGetCards";
import useToasts from "./useToasts";

const useCardActions = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToasts();

  const { mutateAsync: updateCardMutation } = useMutation({
    onMutate: async () => {},

    onSuccess: async (d, data, context) => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });

      if (data.collectionId) {
        queryClient.invalidateQueries({
          queryKey: ["collection", data.collectionId],
        });
        await queryClient.refetchQueries({ queryKey: ["collection"] });
      }
      // console.log("context", context, d, c);
    },
    mutationFn: (data: CardType) => {
      return axios.put(`/card/${data._id}`, data).then((res) => {
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

    updateCardMutation({
      content: content,

      //@ts-ignore
      front: (formData.get("card_word") as string) || front,
      //@ts-ignore
      back: (formData.get("card_translation") as string) || back,
      _id: editId || "",
      collectionId: collectionId || undefined,
    }).then((res) => {
      setIsAddCardModalOpen?.(false);
    });
  };

  const deleteHandler = async (id: string, collectionId?: string) => {
    try {
      const res = await axios.delete(`/card/${id}`);
      addToast("Card Deleted Successfly", "success");
    } catch {
      addToast("Failed to delete the card ", "error");
    } finally {
      if (collectionId) {
        queryClient.invalidateQueries({
          queryKey: [`collection`, collectionId],
        });
        queryClient.invalidateQueries({ queryKey: ["cards"] });
        await queryClient.refetchQueries({ queryKey: ["cards"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["cards"] });
      }
    }
  };

  return { updateCardHandler, deleteHandler };
};

export default useCardActions;
