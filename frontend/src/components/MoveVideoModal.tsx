import React, { FormEvent, useContext, useState } from "react";
import Modal from "./Modal";

import useMediaQuery from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/Drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useGetPlaylists, { PlaylistType } from "@/hooks/useGetPlaylists";
import useDebounce from "@/hooks/useDebounce";
import StatesContext, { statesContext } from "@/context/StatesContext";
import axios from "axios";
import useToasts from "@/hooks/useToasts";

const MoveVideoModal = ({
  isOpen,
  editId,
  setIsOpen,
}: {
  isOpen: boolean;
  editId: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
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

  if (hasNextPage) {
    fetchNextPage();
  }

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selectedPlaylist, setSelectedPlaylist] =
    React.useState<Playlist | null>(null);

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const states = useContext(statesContext);
  const [loading, setLoading] = useState(false);

  const { addToast } = useToasts();
  const queryClient = useQueryClient();
  const movePlaylistHandler = () => {
    setLoading(true);
    if (states?.selectedItems.length) {
      if (!selectedPlaylist) return;
      const { setToastData } = addToast("Moving Videos...", "promise");

      axios
        .post("video/batch-move", {
          ids: states.selectedItems,
          selectedParent:
            selectedPlaylist.value === "remove"
              ? null
              : selectedPlaylist?.value,
        })
        .then((res) => {
          console.log(res);
          setToastData({
            title: "Videos Moved successfully",
            isCompleted: true,
          });

          states.setSelectedItems([]);
          setIsOpen(false);
        })
        .catch((err) => console.log("err", err));
    } else {
      if (!selectedPlaylist) return;
      const { setToastData } = addToast("Moving Video...", "promise");

      axios
        .patch("video/" + editId, {
          playlistId:
            selectedPlaylist.value === "remove"
              ? null
              : selectedPlaylist?.value,
        })
        .then((res) => {
          setToastData({
            title: "Video Moved successfully",
            isCompleted: true,
          });
          setIsOpen(false);
        })
        .catch((err) => console.log("err", err));

      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    }
    setLoading(false);
  };

  return (
    <Modal
      onAnimationEnd={() => setSelectedPlaylist(null)}
      isOpen={isOpen}
      loading={loading}
      setIsOpen={setIsOpen}
    >
      <Modal.Header
        setIsOpen={setIsOpen}
        title="Move To Playlist"
      ></Modal.Header>

      <label className="block mb-2">Choose Playlist : </label>
      {isDesktop ? (
        <Popover open={isSelectOpen} onOpenChange={setIsSelectOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start !w-full !max-w-none"
            >
              {selectedPlaylist ? (
                <>{selectedPlaylist.label}</>
              ) : (
                <>+ Set playlist</>
              )}
            </Button>
          </PopoverTrigger>{" "}
          <PopoverContent className="w-[200px]  z-[100000]  p-0" align="start">
            <PlaylistsList
              setQuery={setQuery}
              playlists={playlists}
              setIsSelectOpen={setIsSelectOpen}
              setSelectedPlaylist={setSelectedPlaylist}
            />
          </PopoverContent>
        </Popover>
      ) : (
        <Drawer open={isSelectOpen} onOpenChange={setIsSelectOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="justify-start w-full">
              {selectedPlaylist ? (
                <>{selectedPlaylist.label}</>
              ) : (
                <>+ Set playlist</>
              )}
            </Button>
          </DrawerTrigger>
          <DrawerContent className=" z-[100000]">
            <div className="mt-4 border-t">
              <PlaylistsList
                setQuery={setQuery}
                playlists={playlists}
                setIsSelectOpen={setIsSelectOpen}
                setSelectedPlaylist={setSelectedPlaylist}
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}

      <Modal.Footer className="flex gap-3 justify-end pt-4 border-t border-gray-100">
        <Button
          onClick={() => setIsOpen(false)}
          type="button"
          variant="destructive"
          size="parent"
        >
          Cancel
        </Button>

        <Button
          size="parent"
          variant="default"
          disabled={!Boolean(selectedPlaylist)}
          onClick={!Boolean(selectedPlaylist) ? () => {} : movePlaylistHandler}
          className="w-full"
        >
          Move To Playlist{" "}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

type Playlist = {
  value: string;
  label: string;
};

function PlaylistsList({
  setIsSelectOpen,
  setSelectedPlaylist,
  playlists,
  setQuery,
}: {
  setIsSelectOpen: (open: boolean) => void;
  setSelectedPlaylist: (playlist: Playlist | null) => void;
  playlists: PlaylistType[] | undefined;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
}) {
  const playlistsList: Playlist[] = [
    { label: "Remove From Any Playlist", value: "remove" },
    ...(playlists?.map((playlist) => ({
      value: playlist._id,
      label: playlist.name,
    })) || []),
  ];

  console.log(playlistsList);

  return (
    <Command
      filter={(value, search) => {
        if (value.toLowerCase().includes(search.toLowerCase())) return 1;
        return 0;
      }}
    >
      <CommandInput placeholder="Filter playlist..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {playlistsList.map((playlist) => (
            <CommandItem
              key={playlist.value}
              value={playlist.label}
              onSelect={(value) => {
                setSelectedPlaylist(
                  playlistsList.find((priority) => priority.label === value) ||
                    null
                );
                setIsSelectOpen(false);
              }}
            >
              {playlist.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
export default MoveVideoModal;
