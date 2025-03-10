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
  collectionId?: string;
};

const useCreateNewCard = ({ optimistic }: Params = {}) => {
  const queryClient = useQueryClient();
  const { addToast } = useToasts();

  const { mutateAsync, data, isPending } = useMutation({
    onMutate: async (newCard) => {
      if (optimistic?.isOptimistic === true) {
        optimistic?.setOptimistic((pre: CardType[]) => [
          newCard,
          ...(pre as CardType[]),
        ]);
      }
    },
    onError: (error, data) => {
      error;
      if (optimistic?.isOptimistic === true) {
        optimistic?.setOptimistic((pre: CardType[]) => pre.slice(0, -1));
      }
    },

    onSuccess: async (res, data) => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
    mutationFn: (data: {}) => {
      return axios.post("/card/", { ...data }).then((res) => {
        console.log(res);
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
    e?.preventDefault();
    const formData = new FormData(e?.target as HTMLFormElement);
    const data = {
      front: formData.get("card_word"),
      back: formData.get("card_translation"),
      ...additionalData,
    };

    console.log(data);
    mutateAsync(data)
      .then(() => {
        setIsAddCardModalOpen(false);
        callback?.();
      })
      .catch(() => {});
  };

  return { createCardHandler, data, isLoading: isPending };
};

export default useCreateNewCard;
