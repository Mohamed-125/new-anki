import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const useCardActions = ({ setIsAddCardModalOpen, content, editId }) => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateCardMutation, data } = useMutation({
    onMutate: async (updatedCard) => {
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
    //   console.log("error", error);
    //   setUserCards((pre) => cards);
    // },

    onSuccess: (res, data) => {
      queryClient.invalidateQueries(["cards"]);
    },
    mutationFn: (data) => {
      console.log("data", data);
      return axios.put(`/card/${data.id}`, data).then((res) => {
        console.log(" card updated successfully !!!", res.data);
        return res.data;
      });
    },
  });

  const updateCardHandler = async (e, setIsAddCardModalOpen) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    console.log(formData.get("card_word"), formData.get("card_translation"));
    updateCardMutation({
      examples: content,
      word: formData.get("card_word"),
      translation: formData.get("card_translation"),
      id: editId,
    }).then((res) => {
      console.log("res", res);
      setIsAddCardModalOpen(false);
    });
  };

  const deleteHandler = async (id) => {
    const res = await axios.delete(`/card/${id}`);

    console.log("res", res);
    queryClient.invalidateQueries(["cards"]);
  };

  return { updateCardHandler, deleteHandler };
};

export default useCardActions;
