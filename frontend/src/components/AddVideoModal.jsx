import React, { useState } from "react";
import Button from "./Button";
import Form from "./Form";
import Loading from "./Loading";
import Modal from "./Modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const AddVideoModal = ({
  setIsVideoModalOpen,
  availableCaptions,
  setAvailavailableCaptions,
}) => {
  const [modalLoading, setModalLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [defaultCaption, setDefaultCaption] = useState("");

  const queryClient = useQueryClient();

  const { mutateAsync: addVideoMutation } = useMutation({
    mutationFn: (data) => axios.post("video", data),
    onSuccess: () => queryClient.invalidateQueries(["videos"]),
  });

  const getVideoAvailavailableCaptions = (url) => {
    setModalLoading(true);
    axios
      .post("/video/getVideoAvailavailableCaptions", { url })
      .catch((err) => {
        if (err.response.data.availableCaptions) {
          console.log("err", err.response.data);
          setAvailavailableCaptions(err.response.data.availableCaptions);
        }

        console.log("err", err);
        setModalLoading(false);
      });
  };

  const getVideoTitleAndThumbnail = (url) => {
    setModalLoading(true);
    const videoId = url
      ?.replace("/watch?v=", "/embed/")
      .split("&")[0]
      .split("embed/")[1];

    axios
      .get("/video/getVideoTitle/" + videoId)
      .then((res) => {
        console.log(res.data);
        setVideoTitle(res.data.title);
        setThumbnail(res.data.thumbnail);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setModalLoading(false);
      });
  };

  const addVideo = (url, selectedSubtitle) => {
    setModalLoading(true);
 
    addVideoMutation({
      url,
      selectedSubtitle,
      videoTitle,
      thumbnail,
      availableCaptions,
      defaultCaption:
        availableCaptions.indexOf(defaultCaption) === -1
          ? 0
          : availableCaptions.indexOf(defaultCaption),
    }).then(() => {
      setIsVideoModalOpen(false);
    });
  };

  const createVideoHandler = (e, setVideos, id) => {
    e.preventDefault();

    const urlInput = document.getElementById("youtubeUrl");
    const errorSpan = document.getElementById("error");

    const youtubeRegex =
      /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;

    if (youtubeRegex.test(urlInput.value)) {
      errorSpan.style.display = "none";

      const formData = new FormData(e.target);
      const url = formData.get("video_url");
      const selectedSubtitle = formData.get("video_subtitle");
      if (!availableCaptions?.length) {
        getVideoAvailavailableCaptions(url);
        getVideoTitleAndThumbnail(url);
        return;
      }

      addVideo(url, selectedSubtitle);
    } else {
      console.log("not vaild");
      errorSpan.style.display = "block";
    }
  };

  return (
    <Modal setIsOpen={setIsVideoModalOpen}>
      {modalLoading && (
        <>
          <Loading />
          <p className="text-center"> Getting the availableCaptions </p>
        </>
      )}
      <Form
        className="w-[100%] max-w-[unset]"
        onSubmit={(e) => {
          createVideoHandler(e);
        }}
      >
        <Form.Title>Add New Video</Form.Title>
        <Form.FieldsContainer>
          <Form.Field>
            <Form.Label>Video Url</Form.Label>
            <Form.Input
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
            {availableCaptions?.length ? (
              <p>Add video</p>
            ) : (
              <p>Get video availableCaptions</p>
            )}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddVideoModal;
