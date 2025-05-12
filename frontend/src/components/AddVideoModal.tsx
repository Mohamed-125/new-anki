import Button from "@/components/Button";
import Form from "@/components/Form";
import Modal from "@/components/Modal";
import useAddVideoHandler from "@/hooks/useAddVideoHandler";
import React from "react";

const AddVideoModal = ({
  channelId,
  topicId,
  isVideoModalOpen,
  setIsVideoModalOpen,
  videoLang = "de",
  listId,
}: {
  channelId?: string;
  topicId?: string;
  isVideoModalOpen: boolean;
  setIsVideoModalOpen: any;
  videoLang?: string;
  listId?: string;
}) => {
  // Using the custom hook for video handling
  const { youtubeUrls, setYoutubeUrls, getTranscript, addVideoHandler } =
    useAddVideoHandler({ topicId, videoLang, channelId, listId });

  return (
    <Modal
      isOpen={isVideoModalOpen}
      loading={getTranscript.isPending}
      setIsOpen={setIsVideoModalOpen}
      className="w-full max-w-lg md:max-w-none"
    >
      <Modal.Header setIsOpen={setIsVideoModalOpen} title="Add YouTube Video" />
      <Form className="p-0 space-y-6" onSubmit={addVideoHandler}>
        <Form.FieldsContainer className="space-y-4">
          <Form.Field>
            <Form.Label>YouTube URLs (one per line)</Form.Label>
            <textarea
              value={youtubeUrls}
              onChange={(e) => setYoutubeUrls(e.target.value)}
              className="px-4 py-2 w-full h-32 text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter YouTube URLs (one per line)"
              required
            />
          </Form.Field>
        </Form.FieldsContainer>
        <Modal.Footer className="flex gap-3 justify-end pt-4 border-t border-gray-100">
          <Button
            onClick={() => setIsVideoModalOpen(false)}
            size="parent"
            type="button"
            variant="danger"
          >
            Cancel
          </Button>
          <Button type="submit" size="parent" disabled={!youtubeUrls?.trim()}>
            Get Transcripts
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddVideoModal;
