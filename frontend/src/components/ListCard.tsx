import { List } from "lucide-react";
import { Link } from "react-router-dom";
import { ListType } from "@/hooks/useGetTopicLists";
import ActionsDropdown from "./ActionsDropdown";
import axios from "axios";
import useToasts from "@/hooks/useToasts";
import { useQueryClient } from "@tanstack/react-query";
import useModalsStates from "@/hooks/useModalsStates";

type ListCardProps = {
  list: ListType;
  topicId: string;
  setIsListModalOpen: (isOpen: boolean) => void;
};

const ListCard = ({ list, topicId, setIsListModalOpen }: ListCardProps) => {
  const { addToast } = useToasts();
  const queryClient = useQueryClient();
  const { defaultValues, setDefaultValues, setSelectedItems } =
    useModalsStates();
  const handleDelete = async () => {
    try {
      await axios.delete(`/list/${list._id}`);
      queryClient.invalidateQueries({ queryKey: ["topic-lists", topicId] });
      addToast("List deleted successfully", "success");
    } catch (error) {
      addToast("Failed to delete list", "error");
    }
  };

  return (
    <div className="flex rounded-lg border p-6 py-7 text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg cursor-pointer bg-white dark:bg-[#242326] hover:translate-y-[-2px] border-[#e5e5e5] dark:border-[#2D2D2D] relative group">
      <Link
        className="flex-1"
        to={`/admin/topics/${topicId}/lists/${list?._id}`}
      >
        <div className="flex flex-1 gap-4 items-center">
          <div className="p-3 bg-blue-100 *:w-6 *:h-6 text-primary rounded-lg dark:bg-indigo-900/30">
            <List />
          </div>
          <div className="flex-1">
            <p className="font-semibold">{list.title}</p>
            {list.description && (
              <p className="mt-1 text-sm text-gray-500">{list.description}</p>
            )}
            {list.tags && list.tags.length > 0 && (
              <div className="flex gap-2 mt-2">
                {list.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-gray-100 rounded-full dark:bg-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
      <ActionsDropdown
        itemId={list._id}
        deleteHandler={handleDelete}
        setSelectedItems={setSelectedItems}
        editHandler={() => {
          setIsListModalOpen(true);
          setDefaultValues({
            editId: list._id,
            listTitle: list.title,
            listDescription: list.description,
            listTags: list.tags,
            listThumbnail: list.thumbnail,
          });
        }}
      />
    </div>
  );
};

export default ListCard;
