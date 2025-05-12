import React from "react";
import Button from "@/components/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BookOpen } from "lucide-react";

interface GrammarToggleButtonProps {
  lessonId: string;
  currentType: string;
}

const GrammarToggleButton = ({
  lessonId,
  currentType,
}: GrammarToggleButtonProps) => {
  const queryClient = useQueryClient();

  const toggleGrammar = useMutation({
    mutationFn: async () => {
      const newType = currentType === "grammar" ? "lesson" : "grammar";
      const response = await axios.patch(`lesson/${lessonId}`, {
        type: newType,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["lesson", lessonId] });
    },
  });

  return (
    <Button
      variant={currentType === "grammar" ? "primary" : "primary-outline"}
      size="sm"
      onClick={() => toggleGrammar.mutate()}
      className="flex gap-2 items-center"
    >
      <BookOpen className="w-4 h-4" />
      {currentType === "grammar" ? "Convert to Lesson" : "Convert to Grammar"}
    </Button>
  );
};

export default GrammarToggleButton;
