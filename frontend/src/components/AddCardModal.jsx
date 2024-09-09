import React, { useCallback, useEffect, useRef, useState } from "react";
import Modal from "../components/Modal";
import Form from "../components/Form";
import Button from "../components/Button";
import JoditEditor from "jodit-react";

export function AddCardModal({
  isAddCardModalOpen,
  setIsAddCardModalOpen,
  createCardHandler,
  defaultValues,
  content,
  setContent,
  setEditId,
  isEdit,
  collectionId = "",
  updateCardHandler,
}) {
  const editor = useRef(null);

  useEffect(() => {
    if (!isAddCardModalOpen) {
      setContent("");
      setEditId("");
    }
  }, [isAddCardModalOpen]);

  useEffect(() => {
    console.log("content", content);
  }, [content]);

  return (
    isAddCardModalOpen && (
      <Modal setIsOpen={setIsAddCardModalOpen}>
        <Form
          className="w-[100%] max-w-[unset]"
          onSubmit={(e) => {
            isEdit
              ? updateCardHandler(e, setIsAddCardModalOpen)
              : createCardHandler(
                  e,
                  { collectionId: collectionId, examples: content },
                  setIsAddCardModalOpen
                );
          }}
        >
          <Form.Title>{isEdit ? "Edit Card" : " Add New Card"} </Form.Title>
          <Form.FieldsContainer>
            <Form.Field>
              <Form.Label>Card Frontside</Form.Label>
              <Form.Input
                defaultValue={defaultValues?.front}
                type="text"
                name="card_word"
              />
            </Form.Field>
            <Form.Field>
              <Form.Label>Card backside</Form.Label>
              <Form.Input
                defaultValue={defaultValues?.back}
                type="text"
                name="card_translation"
              />
            </Form.Field>
            <Form.Field>
              <Form.Label>Examples</Form.Label>
              <JoditEditor
                ref={editor}
                value={content}
                tabIndex={1} // tabIndex of textarea
                onChange={(newContent) => {
                  console.log(newContent);
                }}
                onBlur={(newContent) => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
              />
            </Form.Field>
          </Form.FieldsContainer>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAddCardModalOpen(false)}
              size="parent"
              type="button"
              variant={"danger"}
              className={"mt-8"}
            >
              Cancel
            </Button>{" "}
            <Button size="parent" className={"mt-8"}>
              {isEdit ? "Save Changes" : "Add Card"}
            </Button>
          </div>
        </Form>
      </Modal>
    )
  );
}

export default AddCardModal;
