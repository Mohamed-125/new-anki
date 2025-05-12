import React, { useContext, useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { Share2, Copy, Check } from "lucide-react";
import { statesContext } from "@/context/StatesContext";

const ShareModal = ({ sharing }: { sharing: string }) => {
  const [copied, setCopied] = useState(false);

  const states = useContext(statesContext);
  if (!states) return;
  // In a real app, this would be a proper URL with the domain
  const shareUrl = `${window.location.origin}/${sharing}/${states.shareItemId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Modal
      isOpen={states.isShareModalOpen}
      setIsOpen={states.setIsShareModalOpen}
      className="max-w-md"
    >
      <Modal.Header
        title={
          <div className="flex gap-2 items-center text-xl">
            <Share2 className="w-7 h-7" />
            Share {states.shareItemName}
          </div>
        }
        setIsOpen={states?.setIsShareModalOpen}
      >
        <div className="flex gap-2 items-center mt-2">
          <span></span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Share this set with others by copying the link below.
        </p>
      </Modal.Header>

      <div className="flex items-center mt-4 space-x-2">
        <div className="grid flex-1 gap-2">
          <div className="p-3 text-sm break-all bg-gray-100 rounded-md">
            {shareUrl}
          </div>
        </div>
        <Button
          onClick={handleCopy}
          className="px-3 py-2 h-10"
          aria-label="Copy"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </Button>
      </div>

      <Modal.Footer>
        <Button
          variant="primary-outline"
          onClick={() => {
            states.setIsShareModalOpen(false);
          }}
          className="sm:w-auto"
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default React.memo(ShareModal);
