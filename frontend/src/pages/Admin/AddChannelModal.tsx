import { useState } from "react";
import Modal from "@/components/Modal";
import Form from "@/components/Form";
import Button from "@/components/Button";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

type AddChannelModalProps = {
  topicId: string;
  isChannelModalOpen: boolean;
  setIsChannelModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const AddChannelModal = ({
  topicId,
  isChannelModalOpen,
  setIsChannelModalOpen,
}: AddChannelModalProps) => {
  const [channelUrls, setChannelUrls] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ total: 0, current: 0 });
  const queryClient = useQueryClient();

  const addChannelHandler = async () => {
    try {
      setIsProcessing(true);
      const urls = channelUrls.split("\n").filter((url) => url.trim());
      setProgress({ total: urls.length, current: 0 });

      // Commenting out the concurrent implementation
      // const channelPromises = urls.map((url) => {
      //   console.log("adding channel", url);
      //   return axios
      //     .post("/channel", {
      //       url: url.trim(),
      //       topicId,
      //     })
      //     .then(() => {
      //       console.log("channel added", url);
      //       setProgress((prev) => ({ ...prev, current: prev.current + 1 }));
      //     })
      //     .catch((error) => {
      //       console.error(`Error adding channel ${url}:`, error);
      //     });
      // });
      // await Promise.all(channelPromises);

      // Sequential implementation
      for (const url of urls) {
        try {
          console.log("adding channel", url);
          await axios.post("/channel", {
            url: url.trim(),
            topicId,
          });
          console.log("channel added", url);
          setProgress((prev) => ({ ...prev, current: prev.current + 1 }));
        } catch (error) {
          console.error(`Error adding channel ${url}:`, error);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["topic-channels", topicId] });
      setChannelUrls("");
      setIsChannelModalOpen(false);
    } catch (error) {
      console.error("Error in channel addition process:", error);
    } finally {
      setIsProcessing(false);
      setProgress({ total: 0, current: 0 });
    }
  };

  return (
    <Modal
      isOpen={isChannelModalOpen}
      setIsOpen={setIsChannelModalOpen}
      className="w-full max-w-lg"
    >
      <Modal.Header setIsOpen={setIsChannelModalOpen} title="Add Channels" />
      <Form className="p-0 space-y-6" onSubmit={addChannelHandler}>
        <Form.FieldsContainer className="space-y-4">
          <Form.Field>
            <Form.Label>Channel URLs (one per line)</Form.Label>
            <Form.Textarea
              value={channelUrls}
              onChange={(e) => setChannelUrls(e.target.value)}
              className="px-4 py-2 w-full h-32 text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter Channel URLs (one per line)"
              required
            />
          </Form.Field>
        </Form.FieldsContainer>
        <Modal.Footer className="flex gap-3 justify-end pt-4 border-t border-gray-100">
          <Button
            onClick={() => setIsChannelModalOpen(false)}
            size="parent"
            type="button"
            variant="danger"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="parent"
            disabled={!channelUrls.trim() || isProcessing}
          >
            {isProcessing
              ? `Adding Channels (${progress.current}/${progress.total})...`
              : "Add Channels"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddChannelModal;
