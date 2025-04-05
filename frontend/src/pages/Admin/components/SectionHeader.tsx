import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import ActionsDropdown from "@/components/ActionsDropdown";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import axios from "axios";

interface SectionHeaderProps {
  sectionId: string;
  sectionName: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  sectionId,
  sectionName,
  isExpanded,
  onToggleExpand,
}) => {
  return (
    <div className="p-6 rounded-t-2xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1 cursor-pointer" onClick={onToggleExpand}>
          <div className="flex gap-2 items-center">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
            <h2 className="text-2xl font-semibold">{sectionName}</h2>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <ActionsDropdown
            itemId={sectionId}
            deleteHandler={async () => {
              try {
                await axios.delete(`section/${sectionId}`);
                const queryClient = useQueryClient();
                const { lessonId } = useParams();
                queryClient.invalidateQueries({
                  queryKey: ["lesson", lessonId],
                });
              } catch (err) {
                console.error(err);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SectionHeader;
