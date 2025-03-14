import { useState } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import useToasts from "./useToasts";

interface UsePinSetProps {
  initialPinned?: boolean;
  setId: string;
}

const usePinSet = ({ initialPinned = false, setId }: UsePinSetProps) => {
  const [isPinned, setIsPinned] = useState(initialPinned);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { addToast } = useToasts();

  const togglePin = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call to pin/unpin the set
      // For now, we'll just toggle the state locally
      // await axios.post(`/api/sets/${setId}/${isPinned ? 'unpin' : 'pin'}`);

      // Simulate API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      setIsPinned((prev) => !prev);

      // Invalidate queries to refresh the profile data
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      addToast(
        isPinned ? "Set unpinned successfully" : "Set pinned successfully",
        "success"
      );
    } catch (error) {
      console.error("Error toggling pin status:", error);
      addToast("Faild to pin Set", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isPinned,
    isLoading,
    togglePin,
  };
};

export default usePinSet;
