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
}: {
  channelId?: string;
  topicId?: string;
  isVideoModalOpen: boolean;
  setIsVideoModalOpen: any;
  videoLang?: string;
}) => {
  // Using the custom hook for video handling
  const { youtubeUrl, setYoutubeUrl, getTranscript, addVideoHandler } =
    useAddVideoHandler({ topicId, videoLang, channelId });

  return (
    <Modal
      isOpen={isVideoModalOpen}
      loading={getTranscript.isPending}
      setIsOpen={setIsVideoModalOpen}
      className="w-full max-w-lg"
    >
      <Modal.Header setIsOpen={setIsVideoModalOpen} title="Add YouTube Video" />
      <Form className="p-0 space-y-6" onSubmit={addVideoHandler}>
        <Form.FieldsContainer className="space-y-4">
          <Form.Field>
            <Form.Label>YouTube URL</Form.Label>
            <Form.Input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="px-4 py-2 w-full text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter YouTube URL"
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
          <Button type="submit" size="parent" disabled={!youtubeUrl}>
            Get Transcript
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddVideoModal;
