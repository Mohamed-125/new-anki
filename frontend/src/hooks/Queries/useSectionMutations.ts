import { ResourceType } from "./../../pages/LessonPage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CollectionType } from "../useGetCollections";
import { CardType } from "../useGetCards";
import { NoteType } from "../useGetNotes";

export type sectionType = {
  name: string;
  description?: string;
  img?: string;
  _id: string;
  order: number;
  lessonId: string;
  type: string;
  collections: CollectionType[];
  cards: CardType[];
  notes: NoteType[];
  content: {
    resources: ResourceType[];
    text: string;
    questions: any[];
  };
};

const useSectionMutations = (lessonId: string) => {
  const queryClient = useQueryClient();

  const createSection = useMutation({
    mutationFn: async (sectionData: Omit<sectionType, "_id">) => {
      const response = await axios.post(`section/${lessonId}`, sectionData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["section", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["course", lessonId] });
    },
  });

  const updateSection = useMutation({
    mutationFn: async ({
      id,
      sectionData,
    }: {
      id: string;
      sectionData: Partial<sectionType>;
    }) => {
      const response = await axios.patch(`section/${id}`, sectionData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["section", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["course", lessonId] });
    },
  });

  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`section/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["section", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["course", lessonId] });
    },
  });

  return {
    createSection,
    updateSection,
    deleteSection,
  };
};

export default useSectionMutations;
