// import {
//   useInfiniteQuery,
//   useMutation,
//   useQueryClient,
// } from "@tanstack/react-query";
// import axios from "axios";
// import { useMemo } from "react";
// import useToasts from "../useToasts";
// import QueryKeys from "./QueryKeys";
// const queryClient = useQueryClient();

// export type CardType = {
//   _id: string;
//   front: string;
//   back: string;
//   content?: string;
//   collectionId?: string;
//   userId?: string;
//   easeFactor?: number;
// };

// type GetCardsResponse = {
//   cards: CardType[];
//   cardsCount: number;
//   nextPage: number;
// };

// //invalidateCardsQueries
// export const invalidateCardsQueries = (collectionId?: string) => {
//   queryClient.invalidateQueries({ queryKey: QueryKeys.getCards() });
//   queryClient.refetchQueries({ queryKey: QueryKeys.getCards() });
//   if (collectionId) {
//     queryClient.invalidateQueries({
//       queryKey: QueryKeys.getCollection(collectionId),
//     });
//   }
// };

// // get cards
// export const useGetCards = ({ enabled = true, query = "" }) => {
//   const {
//     data,
//     fetchNextPage,
//     isLoading: isIntialLoading,
//     isFetchingNextPage,
//     refetch,
//   } = useInfiniteQuery({
//     queryKey: query ? QueryKeys.getSearchCards(query) : QueryKeys.getCards(),
//     queryFn: async ({ signal, pageParam, meta }) => {
//       try {
//         const cards = await axios.get(
//           `card/?page=${pageParam}&searchQuery=${query || ""}`,
//           { signal }
//         );
//         return cards.data as GetCardsResponse;
//       } catch (error) {
//         throw error;
//       }
//     },
//     initialPageParam: 0,
//     getNextPageParam: (lastPage, pages) => {
//       if (!lastPage) return undefined;
//       return lastPage.nextPage;
//     },
//   });

//   let userCards = useMemo(() => {
//     return data?.pages.flatMap((page) => (page as GetCardsResponse).cards);
//   }, [data]);

//   return {
//     userCards: userCards,
//     cardsCount: data?.pages[0]?.cardsCount,
//     fetchNextPage,
//     isIntialLoading,
//     refetch,
//     isFetchingNextPage,
//   };
// };

// // add card

// export const { mutateAsync, data, isPending } = useMutation({
//   onMutate: async (newCard) => {
//     let optimistic = newCard?.c;
//     if (optimistic?.isOptimistic === true) {
//       optimistic?.setOptimistic((pre: CardType[]) => [
//         newCard,
//         ...(pre as CardType[]),
//       ]);
//     }
//   },
//   onError: (error, data) => {
//     error;
//     if (optimistic?.isOptimistic === true) {
//       optimistic?.setOptimistic((pre: CardType[]) => pre.slice(0, -1));
//     }
//   },

//   onSuccess: async (res, data) => {
//       invalidateCardsQueries(collectionId);
//   },
//   mutationFn: (data) => {
//     return axios.post("/card/", data).then((res) => {
//       console.log(res);
//       return res.data;
//     });
//   },
// });

// // add optimitic update if needed
// export const { mutateAsync: updateCardMutation } = useMutation({
//   onMutate: async () => {},
//   onSuccess: async (d, data, context) => {
//     invalidateCardsQueries(data.collectionId);
//   },
//   mutationFn: (data: CardType) => {
//     return axios.put(`/card/${data._id}`, data).then((res) => {
//       return res.data;
//     });
//   },
// });
