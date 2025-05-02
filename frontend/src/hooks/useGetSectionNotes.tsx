import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { NoteType } from "./useGetNotes";

const useGetSectionNotes = (sectionId: string) => {
  return useQuery({
    queryKey: ["notes", "section", sectionId],
    queryFn: async ({ signal }) => {
      const response = await axios.get(`note/?sectionId=${sectionId}`, {
        signal,
      });
      return response.data.notes as NoteType[];
    },
    enabled: !!sectionId,
  });
};

export default useGetSectionNotes;
