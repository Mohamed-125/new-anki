import React, { useEffect, useState } from "react";
import Button from "./Button";
import Form from "./Form";
import Loading from "./Loading";
import Modal from "./Modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Select, { SingleValue } from "react-select";

type playlistType = {
  name: string;
  slug: string;
  _id: string;
};

export type OptionType = {
  value: string;
  label: string;
};

type dataType = {
  id?: string;
  url?: string;
  selectedSubtitle: string;
  videoTitle: string;
  thumbnail: string;
  availableCaptions: string[];
  playlistId: string;
  defaultCaption: string;
};

type AddVideoModalProps = {
  setIsVideoModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  defaultValues?: any;
  setAvailavailableCaptions: React.Dispatch<React.SetStateAction<string[]>>;
  availableCaptions: string[];
  isVideoModalOpen: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const AddVideoModal = ({
  setIsVideoModalOpen,
  defaultValues,
  setAvailavailableCaptions,
  availableCaptions,
  className,
  style,
  isVideoModalOpen,
}: AddVideoModalProps) => {
  const [modalLoading, setModalLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [defaultCaption, setDefaultCaption] = useState("");
  const queryClient = useQueryClient();
  const [options, setOptions] = useState<OptionType[]>([]);
  const [selectedSubtitle, setSelectedSubtitle] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState(
    options?.[0]?.value ?? ""
  );

  const { mutateAsync: addVideoMutation } = useMutation({
    mutationFn: (data: dataType) => axios.post("video", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["videos"] }),
  });

  const { mutateAsync: updateVideoMutation } = useMutation({
    mutationFn: (data: dataType) => axios.put(`video/${data.id}`, data),
    onSuccess: (data) => {
      data;
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });

  const {
    data: playlists,
    isLoading: isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["playlists"],
    queryFn: () =>
      axios.get("playlist").then((res) => res.data as playlistType[]),
  });

  // intialze options
  useEffect(() => {
    if (playlists?.length) {
      const options: OptionType[] = playlists?.map((playlist) => ({
        value: playlist._id,
        label: playlist.name,
      }));

      options?.unshift({ value: "", label: "Select a playlist" });
      setOptions(options);
    }
  }, [playlists]);

  const getVideoAvailavailableCaptions = (url: string) => {
    setModalLoading(true);
    axios
      .post("/video/getVideoAvailavailableCaptions", { url })
      .catch((err) => {
        if (err.response.data.availableCaptions) {
          "err", err.response.data;
          setAvailavailableCaptions(err.response.data.availableCaptions);
        }

        "err", err;
        setModalLoading(false);
      });
  };

  const getVideoTitleAndThumbnail = (url: string) => {
    setModalLoading(true);
    const videoId = url
      ?.replace("/watch?v=", "/embed/")
      .split("&")[0]
      .split("embed/")[1];

    axios
      .get("/video/getVideoTitle/" + videoId)
      .then((res) => {
        res.data;
        setVideoTitle(res.data.title);
        setThumbnail(res.data.thumbnail);
      })
      .catch((err) => {
        err;
      })
      .finally(() => {
        setModalLoading(false);
      });
  };

  const addVideo = (url: string) => {
    setModalLoading(true);

    addVideoMutation({
      url,
      selectedSubtitle,
      videoTitle,
      thumbnail,
      availableCaptions,
      playlistId: selectedPlaylist,
      defaultCaption:
        availableCaptions.indexOf(defaultCaption) === -1
          ? availableCaptions[0]
          : availableCaptions[availableCaptions.indexOf(defaultCaption)],
    }).then(() => {
      setIsVideoModalOpen(false);
    });
  };

  const updateVideoHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    defaultValues?.videoId;
    const data = {
      videoUrl,
      selectedSubtitle,
      videoTitle,
      thumbnail,
      availableCaptions,
      playlistId: selectedPlaylist,
      defaultCaption: defaultCaption,
      id: defaultValues?.videoId,
    };

    "data", data;
    updateVideoMutation(data).then(() => {
      setIsVideoModalOpen(false);
    });
  };

  const createVideoHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const urlInput = document.querySelector<HTMLInputElement>("#youtubeUrl");
    const errorSpan = document.querySelector<HTMLSpanElement>("#error");

    if (!urlInput || !errorSpan)
      throw new Error("Error: Url input or error span not found");

    const youtubeRegex =
      /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;

    if (youtubeRegex.test(urlInput.value)) {
      errorSpan.style.display = "none";

      const formData = new FormData(e.target as HTMLFormElement);

      const url = formData.get("video_url") as string;

      const selectedSubtitle = formData.get("video_subtitle");
      if (!availableCaptions?.length) {
        getVideoAvailavailableCaptions(url);
        getVideoTitleAndThumbnail(url);
        return;
      }

      addVideo(url);
    } else {
      ("not vaild");
      errorSpan.style.display = "block";
    }
  };

  useEffect(() => {
    // ("defaultValues", defaultValues);
    setVideoUrl(defaultValues?.videoUrl);
    setAvailavailableCaptions(defaultValues?.videoAvailableCaptions);
    setDefaultCaption(defaultValues?.videoDefaultCaption);
    setVideoTitle(defaultValues?.videoTitle);
    setThumbnail(defaultValues?.videoThumbnail);

    // (options);

    setSelectedPlaylist(defaultValues?.playlistId);
  }, [defaultValues, options]);

  // useEffect(() => {
  //   (selectedPlaylist);
  // }, [selectedPlaylist]);

  return (
    <Modal
      setIsOpen={setIsVideoModalOpen}
      isOpen={isVideoModalOpen}
      className={className}
      style={style}
    >
      {modalLoading && (
        <>
          <Loading />
          <p className="text-center"> Getting the availableCaptions </p>
        </>
      )}
      <Form
        className="w-[100%] max-w-[unset]"
        onSubmit={(e) => {
          defaultValues?.defaultCaption
            ? updateVideoHandler(e)
            : createVideoHandler(e);
        }}
      >
        <Form.Title>
          {defaultValues?.defaultCaption ? "Save Video" : "Add New Video"}
        </Form.Title>
        <Form.FieldsContainer>
          <Form.Field>
            <Form.Label>Video Url</Form.Label>
            <Form.Input
              className="disabled:bg-gray-200 disabled:opacity-45 disabled:cursor-not-allowed"
              disabled={defaultCaption && defaultValues?.videoUrl}
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);

                if (availableCaptions?.length) {
                  setAvailavailableCaptions([]);
                  setVideoTitle("");
                  setThumbnail("");
                }
              }}
              id="youtubeUrl"
              type="url"
              name="video_url"
            />
            <span
              id="error"
              style={{ display: "none" }}
              className="mt-3 text-base text-red-500"
            >
              This is not a vaild url
            </span>
          </Form.Field>
          {availableCaptions?.length ? (
            <>
              <Form.Field>
                <Form.Label>Choose your default caption</Form.Label>

                <select
                  name="video_subtitle"
                  value={defaultCaption}
                  onChange={(e) => {
                    setDefaultCaption(e.target.value);
                  }}
                  className="w-full px-4 py-1 border border-gray-300 rounded-lg"
                >
                  {availableCaptions.map((caption) => (
                    <option value={caption}>{caption}</option>
                  ))}
                </select>
              </Form.Field>

              <Form.Field>
                <Form.Label>Video Playlist</Form.Label>
                <Select
                  onChange={(e: SingleValue<OptionType>) => {
                    if (e) {
                      setSelectedPlaylist(e.value);
                    }
                  }}
                  options={options}
                  value={
                    options?.find(
                      (option: OptionType) => option.value === selectedPlaylist
                    ) || options?.[0]
                  }
                  placeholder="Select a playlist"
                />
              </Form.Field>

              <img src={thumbnail} />
              <h3>Title : {videoTitle}</h3>
            </>
          ) : null}
        </Form.FieldsContainer>
        <div className="flex gap-2">
          <Button
            size="parent"
            type="button"
            onClick={() => {
              setIsVideoModalOpen(false);
            }}
            variant={"danger"}
            className={"mt-8"}
          >
            Cancel
          </Button>{" "}
          <Button size="parent" className={"mt-8"}>
            {availableCaptions?.length
              ? defaultValues?.defaultCaption
                ? "Save video"
                : "Add video"
              : "Get video availableCaptions"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddVideoModal;
