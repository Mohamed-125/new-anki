import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const useCreateNewCard = (optimistic) => {
  const queryClient = useQueryClient();

  const { mutateAsync, data, isLoading } = useMutation({
    onMutate: async (newCard) => {
      console.log(optimistic?.isOptimistic);
      if (optimistic?.isOptimistic === true) {
        console.log("opatimtic is true");
        optimistic?.setState((pre) => [...pre, newCard]);
      }
    },
    onError: (error, data) => {
      console.log(error);
      if (optimistic?.isOptimistic === true) {
        optimistic?.setState((pre) => pre.slice(0, -1));
      }
    },

    onSuccess: (res, data) => {
      queryClient.invalidateQueries(["cards"]);
    },
    mutationFn: (data) => {
      console.log("cardData", data);
      return axios.post("/card/", data).then((res) => {
        console.log("new card created !!!", res.data);
        return res.data;
      });
    },
  });

  const createCardHandler = async (
    e,
    additionalData = {},
    setIsAddCardModalOpen,
    callback
  ) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      word: formData.get("card_word"),
      translation: formData.get("card_translation"),
      ...additionalData,
    };
    mutateAsync(data).then(() => {
      setIsAddCardModalOpen(false);
      callback();
    });
  };

  return { createCardHandler, data, isLoading };
};

export default useCreateNewCard;
