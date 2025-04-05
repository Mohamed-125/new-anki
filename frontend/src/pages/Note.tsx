import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import Loading from "../components/Loading";
import TranslationWindow from "../components/TranslationWindow";
import AddCardModal from "../components/AddCardModal";
import useGetCards from "../hooks/useGetCards";
import useSelection from "@/hooks/useSelection";
import useModalsStates from "@/hooks/useModalsStates";
import ActionsDropdown from "@/components/ActionsDropdown";
import ShareModal from "@/components/ShareModal";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import { NoteType } from "@/hooks/useGetNotes";
import useToasts from "@/hooks/useToasts";

const Note = () => {
  const id = useParams()?.id;
  const { data: note, isLoading } = useQuery({
    queryKey: ["note", id],
    queryFn: async () => {
      const response = await axios.get("note/" + id);
      return response.data as NoteType;
    },
  });

  const { userCards } = useGetCards({});
  const navigate = useNavigate();

  const deleteNoteHandler = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this note?"
    );
    if (confirm) {
      await axios.delete(`note/${id}`);
      navigate("/notes", { replace: true });
    }
  };

  const { setDefaultValues, setIsAddCardModalOpen, setContent } =
    useModalsStates();

  const onCardClick = useCallback(
    (card: any) => {
      setDefaultValues({
        front: card.front,
        back: card.back,
        content: card?.content,
      });
      setIsAddCardModalOpen(true);
    },
    [setDefaultValues, setIsAddCardModalOpen]
  );

  const { selectionData } = useSelection();
  const { setIsShareModalOpen, setShareItemId, setShareItemName } =
    useModalsStates();

  const shareHandler = () => {
    if (!note) return;
    setIsShareModalOpen(true);
    setShareItemId(note._id);
    setShareItemName(note?.title);
  };

  const { user } = useGetCurrentUser();
  const isSameUser = user?._id === note?.userId;

  const { addToast } = useToasts();
  const queryClient = useQueryClient();

  const forkNoteHandler = async () => {
    const toast = addToast("Forking note...", "promise");
    try {
      const response = await axios.post(`note/fork/${note?._id}`);
      navigate(`/notes/${response.data._id}`);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.setToastData({
        title: "Note forked successfully!",
        isCompleted: true,
      });
    } catch (err) {
      toast.setToastData({ title: "Failed to fork note", type: "error" });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container w-[90%] border-2 border-light-gray p-4 mb-8 bg-white rounded-2xl sm:px-2 sm:text-base">
      <ShareModal sharing="notes" />
      <TranslationWindow
        setIsAddCardModalOpen={setIsAddCardModalOpen}
        setDefaultValues={setDefaultValues}
        setContent={setContent}
        isSameUser={isSameUser}
        selectionData={selectionData}
      />
      <div className="flex gap-4 justify-between items-center px-4 my-4">
        <h1 className="text-3xl font-bold sm:text-xl">{note?.title}</h1>
        <div className="flex gap-2">
          <ActionsDropdown
            itemId={note?._id as string}
            shareHandler={shareHandler}
            isSameUser={isSameUser}
            forkData={{
              forking: "add to your notes",
              handler: forkNoteHandler,
            }}
            editHandler={() => {
              navigate(`/notes/edit/${id}`);
            }}
            deleteHandler={deleteNoteHandler}
          />
        </div>
      </div>

      <hr className="my-4"></hr>

      <div className="text-div">
        <div
          className="select-text"
          dangerouslySetInnerHTML={{ __html: note?.content || "" }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target?.classList.contains("highlight")) {
              const cardId = target.getAttribute("data-id");
              const card = userCards?.find((c) => c._id === cardId);
              if (card) onCardClick(card);
            }
          }}
        ></div>
      </div>
    </div>
  );
};

export default Note;
