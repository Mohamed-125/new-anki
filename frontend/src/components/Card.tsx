import useCardActions from "../hooks/useCardActions";
import { HiSwitchHorizontal } from "react-icons/hi";
import { CollectionType } from "@/hooks/useGetCollections";

import ActionsDropdown from "./ActionsDropdown";
import SelectCheckBox from "./SelectCheckBox";
import useModalStates from "@/hooks/useModalsStates";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import { TextToSpeech } from "./TextToSpeech";

type CardProps = {
  id: string;
  playlistName?: string;
  isSelected?: boolean;
  card: any;
  video?: any;
  note?: any;
  deleteHandler?: any;
  navigateTo?: any;
  collectionId?: string;
  collection?: CollectionType;
  sectionId?: string;
};

const Card = ({
  id,
  sectionId,
  card,
  playlistName,
  video,
  note,
  navigateTo,
  collectionId,
  collection,
}: CardProps) => {
  const {
    setIsMoveToCollectionOpen,
    setEditId,
    setContent,
    selectedItems,
    setSelectedItems,
    setIsAddCardModalOpen,
    setDefaultValues,
  } = useModalStates();

  if (!card) return;
  const { back, content, front } = card;

  const { user } = useGetCurrentUser();

  const isSameUser = user?._id === card.userId || Boolean(sectionId);

  const { updateCardHandler } = useCardActions();

  const switchHandler = () => {
    updateCardHandler(
      undefined,
      undefined,
      undefined,
      id,
      undefined,
      back,
      front
    );
  };

  const deleteHandlerFunc = useCardActions().deleteHandler;

  const moveHandler = () => {
    setIsMoveToCollectionOpen?.(true);
    setEditId(id);
  };
  const deleteHandler = () => {
    deleteHandlerFunc(id, collectionId);
  };

  return (
    <div
      onClick={
        isSameUser
          ? () => {
              navigateTo?.();
              setDefaultValues({
                front: card?.front,
                back: card?.back,
                content: card?.content,
                collectionId: card?.collectionId,
                collectionName: collection?.name,
                collectionPublic: collection?.public,
                playlistName,
                playlistId: video?.playlistId || id,
                videoUrl: video?.url,
                defaultCaption: video?.defaultCaption,
                videoTitle: video?.title,
                videoThumbnail: video?.thumbnail,
                videoAvailableCaptions: video?.availableCaptions,
                videoDefaultCaption: video?.defaultCaption,
                videoId: video?._id,
                noteId: note?._id,
                noteContent: note?.content,
                noteTitle: note?.title,
              });

              setIsAddCardModalOpen?.(true);
              setContent?.(content ? content : "");
              setEditId(id);
            }
          : () => {}
      }
      className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-300 cursor-pointer hover:shadow-md"
      id={id}
    >
      <div className="flex justify-between items-start">
        <div className="flex overflow-hidden gap-4 whitespace-normal break-words grow text-ellipsis">
          {isSameUser && (
            <button
              className="p-1.5 text-gray-500 hover:text-indigo-600  rounded-md transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                switchHandler();
              }}
            >
              <HiSwitchHorizontal className="w-6 h-6" />
            </button>
          )}
          <div>
            <div className="flex gap-2 items-center mb-2">
              <p className="text-lg font-medium text-gray-900">{front}</p>
              <TextToSpeech text={front} />
            </div>
            <p className="text-sm text-gray-500">{back}</p>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <div onClick={(e) => e.stopPropagation()}>
            {isSameUser ? (
              !selectedItems?.length ? (
                <ActionsDropdown
                  isCard={true}
                  setSelectedItems={setSelectedItems}
                  itemId={id}
                  moveHandler={moveHandler}
                  deleteHandler={deleteHandler}
                />
              ) : (
                <SelectCheckBox
                  id={id}
                  selectedItems={selectedItems}
                  setSelectedItems={setSelectedItems}
                />
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
