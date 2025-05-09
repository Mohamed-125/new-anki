import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CardType } from "./useGetCards";
import useToasts from "./useToasts";
import useGetCurrentUser from "./useGetCurrentUser";

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

  const { selectedLearningLanguage } = useGetCurrentUser();

  const createCardHandler = async (
    e: React.FormEvent<HTMLFormElement> | null,
    additionalData: any = {}
  ) => {
    e?.preventDefault();
    const formData = new FormData(e?.target as HTMLFormElement);
    const data = {
      front: formData.get("card_word"),
      back: formData.get("card_translation"),
      language: selectedLearningLanguage,
      ...additionalData,
    };

    return mutateAsync(data);
  };

  return { createCardHandler, data, isLoading: isPending };
};

export default useCreateNewCard;
