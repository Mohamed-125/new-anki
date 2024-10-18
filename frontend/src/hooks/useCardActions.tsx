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
      // let cards = setUserCards((pre) => {
      //   pre?.map((card) => {
      //     if (card._id === updatedCard._id) {
      //       return updatedCard;
      //     } else {
      //       return card;
      //     }
      //   });
      // });
      // return { cards };
    },
    // onError: (error, data, { cards }) => {
    //   ("error", error);
    //   setUserCards((pre) => cards);
    // },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
    mutationFn: (data: CardType) => {
      return axios.put(`/card/${data._id}`, data).then((res) => {
        " card updated successfully !!!", res.data;
        return res.data;
      });
    },
  });

  const updateCardHandler = async (
    e: React.FormEvent<HTMLFormElement>,
    setIsAddCardModalOpen: React.Dispatch<SetStateAction<boolean>>,
    content: string,
    editId?: string,
    collectionId?: string
  ) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    editId;
    updateCardMutation({
      content: content,
      front: formData.get("card_word") as string,
      back: formData.get("card_translation") as string,
      _id: editId || "",
      collectionId: collectionId,
    }).then((res) => {
      "res", res;
      setIsAddCardModalOpen(false);
    });
  };

  const deleteHandler = async (id: string) => {
    try {
      const res = await axios.delete(`/card/${id}`);
      "res", res;
      addToast("Card Deleted Successfly", "success");
    } catch {
      addToast("Failed to delete the card ", "error");
    }

    queryClient.invalidateQueries({ queryKey: ["cards"] });
  };

  return { updateCardHandler, deleteHandler };
};

export default useCardActions;
