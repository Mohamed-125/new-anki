import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { VideoType } from "./Playlist";

type PlaylistType = {
  name: string;
  videos?: VideoType[];
  videosCount?: number;
  _id?: string;
};

const Playlists = () => {
  const {
    data: playlists,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["playlists"],
    queryFn: async () => {
      const res = await axios.get("playlist");
      return res.data;
    },
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: async (data: PlaylistType) => {
      ("mutation ran");
      return axios.post("playlist", data).then((res) => {
        return res.data;
      });
    },
    onMutate: async (newPlaylist) => {
      await queryClient.cancelQueries({ queryKey: ["playlists"] });

      const previousPlaylists = queryClient.getQueryData(["playlists"]);
      queryClient.setQueryData(["playlists"], (old: PlaylistType[]) => {
        return [...old, newPlaylist];
      });

      return { previousPlaylists };
    },
    onError: (error, newPlaylist, context) => {
      queryClient.setQueryData(["playlists"], context?.previousPlaylists);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });

  const createPlaylistHandler = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("playlist_name"),
    };

    mutate(data as PlaylistType);
  };

  const updatePlaylistHandler = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("playlist_name"),
    };
    axios
      .put(`playlist/${editId}`, data)
      .then((res) => {
        queryClient.invalidateQueries({ queryKey: ["playlists"] });
      })
      .catch((err) => err)
      .finally(() => {
        setIsPlayListModalOpen(false);
      });
  };

  const deletePlaylistHandler = (playlistId: string) => {
    axios
      .delete(`playlist/${playlistId}`)
      .then((res) => {
        queryClient.invalidateQueries({ queryKey: ["playlists"] });
      })
      .catch((err) => err);
  };

  const [isPlayListModalOpen, setIsPlayListModalOpen] = React.useState(false);
  const [defaultValues, setDefaultValues] = useState({});
  const [editId, setEditId] = useState("");
  const [filteredPlaylists, setFilteredPlaylists] = useState<PlaylistType[]>(
    []
  );
  const [actionsDivId, setActionsDivId] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  isLoading && (
    <div>
      <Loading />
    </div>
  );

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
          setIsOpen={setIsPlayListModalOpen}
          isOpen={isPlayListModalOpen}
          defaultValues={defaultValues}
          createPlaylistHandler={createPlaylistHandler}
          updatePlaylistHandler={updatePlaylistHandler}
        />
      </>

      {playlists?.length ? (
        <>
          <Search
            setState={setFilteredPlaylists}
            label={"Search your playlists"}
            items={playlists}
            filter={"name"}
          />
          <h6 className="mt-4 text-lg font-bold text-gray-400">
            Cards in collection : {playlists?.length}
          </h6>
          <Button
            className="py-4 my-6 ml-auto mr-0 text-white bg-blue-600 border-none"
            onClick={() => setIsPlayListModalOpen(true)}
          >
            Create new playlist
          </Button>

          <SelectedItemsController
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            isItemsPlaylists={true}
          />

          <div className="grid gap-2 grid-container">
            {filteredPlaylists.map((playlist) => {
              const id = playlist._id;

              if (!id) return;
              const isSelected = selectedItems.includes(id);
              return (
                <div
                  id={id}
                  className="flex items-center px-4 py-5 bg-white border shadow-lg rounded-xl border-neutral-300 "
                  key={id}
                >
                  <input
                    checked={isSelected}
                    type="checkbox"
                    className="!min-w-6 !h-6 mr-4"
                    onChange={(e) => {
                      setSelectedItems((pre) => {
                        if (pre.length) {
                          if (e.target.checked) {
                            return [...pre, id];
                          } else {
                            return [...pre.filter((item) => item !== id)];
                          }
                        } else {
                          return pre;
                        }
                      });
                    }}
                  />{" "}
                  <Link to={`/playlists/${playlist._id}`}>
                    <h2>{playlist.name}</h2>
                    <p className="mt-3 text-sm font-medium text-gray-500">
                      {playlist?.videosCount} Videos in this playlist
                    </p>
                  </Link>
                  <Actions
                    setIsModalOpen={setIsPlayListModalOpen}
                    setDefaultValues={setDefaultValues}
                    // setIsPlaylistModalOpen={setIsPlayListModalOpen}
                    id={id}
                    setEditId={setEditId}
                    deleteHandler={deletePlaylistHandler}
                    setActionsDivId={setActionsDivId}
                    isActionDivOpen={actionsDivId === playlist._id}
                    playlistName={playlist.name}
                  />
                </div>
              );
            })}
          </div>

          <Search.NotFound
            state={filteredPlaylists}
            searchFor={"collection"}
            filter={"name"}
          />
        </>
      ) : (
        <Button className="mt-11" onClick={() => setIsPlayListModalOpen(true)}>
          There is not playlists Create Your First Now{" "}
        </Button>
      )}
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
}: {
  createPlaylistHandler: any;
  updatePlaylistHandler: any;
  defaultValues: any;
  setIsOpen: any;
  isOpen: boolean;
}) => {
  return (
    <Modal setIsOpen={setIsOpen} isOpen={isOpen}>
      <Form
        className="w-[100%] max-w-[unset]"
        onSubmit={(e) =>
          defaultValues?.playlistName
            ? updatePlaylistHandler(e)
            : createPlaylistHandler(e)
        }
      >
        <Form.Title>
          {defaultValues?.playlistName
            ? "Edit This Playlist"
            : "Add New Playlist"}
        </Form.Title>
        <Form.Field>
          <Form.Label>Playlist Name</Form.Label>
          <Form.Input
            defaultValue={defaultValues?.playlistName}
            type="text"
            name="playlist_name"
          />
        </Form.Field>

        <div className="flex gap-2">
          <Button
            onClick={() => setIsOpen(false)}
            size="parent"
            type="button"
            variant={"danger"}
            className={"mt-8"}
          >
            Cancel
          </Button>
          <Button size="parent" className={"mt-8"}>
            {defaultValues?.playlistName ? "Save Changes" : "Add Playlist"}
          </Button>{" "}
        </div>
      </Form>
    </Modal>
  );
};
