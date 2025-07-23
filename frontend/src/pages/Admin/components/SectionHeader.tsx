import React from "react";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import ActionsDropdown from "@/components/ActionsDropdown";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import axios from "axios";
import useToasts from "@/hooks/useToasts";

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
  const { addToast } = useToasts();
  const queryClient = useQueryClient();
  const { lessonId } = useParams();

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
              const toast = addToast("Deleting section...", "promise");
              try {
                await axios.delete(`section/${sectionId}`);
                queryClient.invalidateQueries({
                  queryKey: ["section", lessonId],
                });
                toast.setToastData({
                  title: "Section deleted successfully!",
                  type: "success",
                });
              } catch (err) {
                console.log(err);
                toast.setToastData({
                  title: "Failed to delete section",
                  type: "error",
                });
              }
            }}
            customButtons={[
              {
                label: "Duplicate",
                icon: <Copy className="text-xl" />,
                handler: async () => {
                  const toast = addToast("Duplicating section...", "promise");
                  try {
                    const response = await axios.post(
                      `section/${sectionId}/duplicate?lessonId=${lessonId}`
                    );

                    console.log(response);
                    queryClient.invalidateQueries({
                      queryKey: ["section", lessonId],
                    });
                    toast.setToastData({
                      title: "Section duplicated successfully!",
                      type: "success",
                    });
                  } catch (err) {
                    console.log(err);
                    toast.setToastData({
                      title: "Failed to duplicate section",
                      type: "error",
                    });
                  }
                },
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(SectionHeader);
