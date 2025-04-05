import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { FormEvent, useEffect, useState } from "react";
import Loading from "../components/Loading";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Form from "../components/Form";
import Search from "../components/Search";
import { Link } from "react-router-dom";
import Actions from "../components/ActionsDropdown";
import SelectedItemsController from "../components/SelectedItemsController";
import { MdFeaturedPlayList, MdOutlinePlaylistPlay } from "react-icons/md";
import ItemCard from "@/components/ui/ItemCard";
import CollectionSkeleton from "@/components/CollectionsSkeleton";
import useGetPlaylists from "@/hooks/useGetPlaylists";
import useDebounce from "@/hooks/useDebounce";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import useToasts from "@/hooks/useToasts";
import { VideoType } from "@/hooks/useGetVideos";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";

type PlaylistType = {
  name: string;
  videos?: VideoType[];
  videosCount?: number;
  _id?: string;
};

const Playlists = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  const {
    playlists,
    playlistsCount,
    fetchNextPage,
    isInitialLoading,
    hasNextPage,
    isFetchingNextPage,
  } = useGetPlaylists({ query: debouncedQuery });

  useInfiniteScroll(fetchNextPage, hasNextPage);

  const queryClient = useQueryClient();
  const { addToast } = useToasts();
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = useMutation({
    mutationFn: async (data: PlaylistType) => {
      return axios.post("playlist", data).then((res) => {
        return res.data;
      });
    },
    onMutate: async (newPlaylist) => {
      await queryClient.cancelQueries({ queryKey: ["playlists"] });
      const previousPlaylists = queryClient.getQueryData(["playlists"]);
      return { previousPlaylists };
    },
    onError: (error, newPlaylist, context) => {
      queryClient.setQueryData(["playlists"], context?.previousPlaylists);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
  const { selectedLearningLanguage } = useGetCurrentUser();

  const createPlaylistHandler = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("playlist_name"),
      selectedLearningLanguage,
    };

    const toast = addToast("Creating playlist...", "promise");
    setIsLoading(true);

    mutate(data as PlaylistType, {
      onSuccess: () => {
        toast.setToastData({
          title: "Playlist created successfully!",
          isCompleted: true,
        });
        setIsPlayListModalOpen(false);
        setIsLoading(false);
      },
      onError: (err) => {
        console.log(err);
        setIsLoading(false);
        toast.setToastData({
          title: "Failed to create playlist",
          type: "error",
        });
      },
    });
  };

  const updatePlaylistHandler = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("playlist_name"),
    };

    const toast = addToast("Updating playlist...", "promise");
    setIsLoading(true);
    axios
      .patch(`playlist/${editId}`, data)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["playlists"] });
        setIsPlayListModalOpen(false);
        toast.setToastData({
          title: "Playlist updated successfully!",
          isCompleted: true,
        });
      })
      .catch(() => {
        toast.setToastData({
          title: "Failed to update playlist",
          type: "error",
        });
      })
      .finally(() => {
        setIsLoading(false);
        setIsPlayListModalOpen(false);
      });
  };

  const deletePlaylistHandler = (playlistId: string) => {
    const toast = addToast("Deleting playlist...", "promise");
    axios
      .delete(`playlist/${playlistId}`)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["playlists"] });
        toast.setToastData({
          title: "Playlist deleted successfully!",
          isCompleted: true,
        });
      })
      .catch(() => {
        toast.setToastData({
          title: "Failed to delete playlist",
          type: "error",
        });
      });
  };

  const [isPlayListModalOpen, setIsPlayListModalOpen] = React.useState(false);
  const [defaultValues, setDefaultValues] = useState({});
  const [editId, setEditId] = useState("");

  const [actionsDivId, setActionsDivId] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    isPlayListModalOpen;
  }, [isPlayListModalOpen]);

  useEffect(() => {
    if (!isPlayListModalOpen) {
      setDefaultValues({});
    }
  }, [isPlayListModalOpen]);

  return (
    <div className="container">
      <>
        <AddNewPlaylistModal
          isLoading={isLoading}
          setIsOpen={setIsPlayListModalOpen}
          isOpen={isPlayListModalOpen}
          defaultValues={defaultValues}
          createPlaylistHandler={createPlaylistHandler}
          updatePlaylistHandler={updatePlaylistHandler}
        />
      </>

      <>
        <Search query={query} setQuery={setQuery} searchingFor="playlists" />
        <h6 className="mt-4 text-lg font-bold text-gray-400">
          Playlists : {playlistsCount}
        </h6>
        <Button
          className="py-4 my-6 mr-0 ml-auto text-white bg-blue-600 border-none"
          onClick={() => setIsPlayListModalOpen(true)}
        >
          Create new playlist
        </Button>

        <SelectedItemsController isItemsPlaylists={true} />

        <div className="grid gap-2 grid-container">
          {playlists?.map((playlist) => (
            <ItemCard
              key={playlist._id}
              Icon={<MdOutlinePlaylistPlay />}
              name={playlist.name}
              deleteHandler={() => deletePlaylistHandler(playlist._id)}
              subText={`${playlist?.videosCount} Videos in this playlist`}
              id={playlist._id}
            />
          ))}
          {(isInitialLoading || isFetchingNextPage) && <CollectionSkeleton />}
        </div>
      </>
    </div>
  );
};

export default Playlists;

const AddNewPlaylistModal = ({
  createPlaylistHandler,
  isOpen,
  updatePlaylistHandler,
  defaultValues = {},
  setIsOpen,
  isLoading,
}: {
  createPlaylistHandler: any;
  updatePlaylistHandler: any;
  defaultValues: any;
  setIsOpen: any;
  isOpen: boolean;
  isLoading: boolean;
}) => {
  return (
    <Modal loading={isLoading} setIsOpen={setIsOpen} isOpen={isOpen}>
      <Modal.Header
        title={
          defaultValues?.playlistName
            ? "Edit This Playlist"
            : "Add New Playlist"
        }
        setIsOpen={setIsOpen}
      ></Modal.Header>
      <Form
        className="w-[100%] max-w-[unset]"
        onSubmit={async (e) => {
          defaultValues?.playlistName
            ? updatePlaylistHandler(e)
            : createPlaylistHandler(e);
        }}
      >
        <Form.Field>
          <Form.Label>Playlist Name</Form.Label>
          <Form.Input
            required
            defaultValue={defaultValues?.playlistName}
            type="text"
            name="playlist_name"
          />
        </Form.Field>
        <Modal.Footer>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsOpen(false)}
              size="parent"
              type="button"
              variant={"danger"}
            >
              Cancel
            </Button>
            <Button size="parent">
              {defaultValues?.playlistName ? "Save Changes" : "Add Playlist"}
            </Button>{" "}
          </div>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
