import axios from "axios";

type ConjugationType = {
  tense: string;
  conjugations: { person: string; form: string }[];
};

export const fetchConjugations = async (
  word: string,
  sourceLang: string,
  onError?: (message: string) => void,
  onLoading?: (loading: boolean) => void
): Promise<ConjugationType[]> => {
  onLoading?.(true);
  try {
    const response = await axios.post("/scrape-conjugations", {
      word,
      language: sourceLang,
    });
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error || "Failed to get the conjugation";
    onError?.(errorMessage);
    return [];
  } finally {
    onLoading?.(false);
  }
};
