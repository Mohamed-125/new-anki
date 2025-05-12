import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import useModalStates from "@/hooks/useModalsStates";
import useToasts from "@/hooks/useToasts";

const ExportJsonModal = () => {
  const { defaultValues, setDefaultValues } = useModalStates();
  const { addToast } = useToasts();

  const handleCopy = () => {
    if (!defaultValues?.exportJson) return;

    navigator.clipboard
      .writeText(defaultValues.exportJson)
      .then(() => {
        addToast("JSON copied to clipboard!", "success");
        setDefaultValues((prev) => ({ ...prev, isExportModalOpen: false }));
      })
      .catch(() => {
        addToast("Failed to copy JSON", "error");
      });
  };

  return (
    <Modal
      isOpen={defaultValues?.isExportModalOpen}
      setIsOpen={(isOpen) =>
        setDefaultValues((prev) => ({ ...prev, isExportModalOpen: isOpen }))
      }
      className="w-full max-w-2xl"
    >
      <Modal.Header
        title="Export Cards JSON"
        setIsOpen={(isOpen) =>
          setDefaultValues((prev) => ({ ...prev, isExportModalOpen: isOpen }))
        }
      />
      <div className="p-4 space-y-4">
        <div className="overflow-auto p-4 max-h-96 bg-gray-50 rounded-lg">
          <pre className="font-mono text-sm whitespace-pre-wrap break-words">
            {defaultValues?.exportJson}
          </pre>
        </div>
        <div className="flex gap-3 justify-end">
          <Button
            variant="primary"
            onClick={handleCopy}
            className="flex gap-2 items-center"
          >
            <span>📋</span> Copy to Clipboard
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportJsonModal;
