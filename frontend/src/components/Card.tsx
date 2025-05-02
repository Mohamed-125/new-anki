import useCardActions from "../hooks/useCardActions";
import { HiSwitchHorizontal } from "react-icons/hi";
import { CollectionType } from "@/hooks/useGetCollections";

import ActionsDropdown from "./ActionsDropdown";
import SelectCheckBox from "./SelectCheckBox";
import useModalStates from "@/hooks/useModalsStates";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";

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
      className="flex items-center px-8 py-4 mb-4 max-w-full bg-white hover:scale-[101%] duration-[400ms] rounded-xl border shadow-md transition-all cursor-pointer hover:shadow-lg card border-neutral-300"
      id={id}
    >
      {isSameUser && (
        <div className="mr-3 text-2xl" onClick={switchHandler}>
          <HiSwitchHorizontal />
        </div>
      )}

      <div className="overflow-hidden whitespace-normal break-words grow text-ellipsis">
        <p className="text-lg sm:text-base">{front}</p>
        <small className="text-base text-gray-500 truncate">{back}</small>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        {isSameUser ? (
          !selectedItems?.length ? (
            <>
              <ActionsDropdown
                isCard={true}
                setSelectedItems={setSelectedItems}
                itemId={id}
                moveHandler={moveHandler}
                deleteHandler={deleteHandler}
              />
            </>
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
  );
};

export default Card;
