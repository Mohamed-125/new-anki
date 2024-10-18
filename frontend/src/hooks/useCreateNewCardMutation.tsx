import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CardType } from "./useGetCards";
import useToasts from "./useToasts";

type Optimistic = {
  isOptimistic?: boolean;
  setOptimistic: (state: any) => void;
};

type Params = {
  optimistic?: Optimistic;
};

const useCreateNewCard = ({ optimistic }: Params = {}) => {
  const queryClient = useQueryClient();
  const { addToast } = useToasts();

  const { mutateAsync, data, isPending } = useMutation({
    onMutate: async (newCard) => {
      optimistic?.isOptimistic;
      if (optimistic?.isOptimistic === true) {
        ("opatimtic is true");
        optimistic?.setOptimistic((pre: CardType[]) => [
          ...(pre as CardType[]),
          newCard,
        ]);
      }
    },
    onError: (error, data) => {
      error;
      if (optimistic?.isOptimistic === true) {
        optimistic?.setOptimistic((pre: CardType[]) => pre.slice(0, -1));
      }
    },

    onSuccess: (res, data) => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
    mutationFn: (data) => {
      "cardData", data;
      return axios.post("/card/", data).then((res) => {
        "new card created !!!", res.data;
        return res.data;
      });
    },
  });

  const createCardHandler = async (
    e: React.FormEvent<HTMLFormElement>,
    additionalData: any = {},
    setIsAddCardModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    callback?: () => void
  ) => {
    e;
    e?.preventDefault();
    const formData = new FormData(e?.target as HTMLFormElement);
    const data = {
      front: formData.get("card_word"),
      back: formData.get("card_translation"),
      ...additionalData,
    };
    mutateAsync(data)
      .then(() => {
        setIsAddCardModalOpen(false);
        callback?.();
        addToast("New Card Added Successfly", "success");
      })
      .catch(() => {
        addToast("Failed To Add Card ", "error");
      });
  };

  return { createCardHandler, data, isLoading: isPending };
};

export default useCreateNewCard;
