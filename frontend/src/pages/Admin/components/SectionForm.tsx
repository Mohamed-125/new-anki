import React, { useEffect, useState } from "react";
import Form from "@/components/Form";
import TipTapEditor from "@/components/TipTapEditor";
import Button from "@/components/Button";
import QuestionList from "./QuestionList";
import QuestionForm from "./QuestionForm";
import ResourceForm from "./ResourceForm";
import { Editor } from "@tiptap/react";
import { sectionType } from "@/hooks/Queries/useSectionMutations";

interface SectionFormProps {
  hasUnsavedChanges?: boolean;
  section: sectionType;
  sectionType: string;
  setSectionType: (type: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCopy: () => void;
  setEditId: React.Dispatch<React.SetStateAction<string>>;
  questionsBySectionId: any;
  deleteQuestionHandler: (id: number) => void;
  showQuestionDropdown: boolean;
  setShowQuestionDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  addQuestionHandler: (type: "choose" | "text") => void;
  handlePasteContent: any;
  resources: any;
  setResources: any;
  editor: Editor | null;
  setContent: React.Dispatch<React.SetStateAction<string>>;
}

interface Resource {
  type: "video" | "image" | "audio";
  url: string;
  title?: string;
}

const SectionForm: React.FC<SectionFormProps> = ({
  section,
  sectionType,
  setSectionType,
  onSubmit,
  onCopy,
  setEditId,
  questionsBySectionId,
  deleteQuestionHandler,
  showQuestionDropdown,
  setShowQuestionDropdown,
  addQuestionHandler,
  handlePasteContent,
  resources,
  setResources,
  editor,
  setContent,
}) => {
  const handleAddResource = (resource: Resource) => {
    setResources([...resources, resource]);
  };

  const handleRemoveResource = (index: number) => {
    setResources(resources.filter((_: any, i: number) => i !== index));
  };

  useEffect(() => {
    if (section) {
      setContent(section.content?.text);
      setSectionType(section.type);
      setResources(section.content?.resources || []);
    }
  }, [section]);

  return (
    <Form onSubmit={onSubmit} className="relative px-0 pt-3">
      <div className="flex gap-2 items-center mb-7">
        <h4 className="font-bold">Type: {section.type} </h4>
        <Form.Select
          className="mb-0"
          defaultValue={section.type}
          onChange={(e) => setSectionType(e.target.value)}
        >
          <option value={"text"}>Text</option>
          <option value={"excercises"}>Excercises</option>
          <option value={"resources"}>Resources</option>
        </Form.Select>
      </div>
      <Form.FieldsContainer>
        <Form.Field>
          <Form.Label>Section Name</Form.Label>
          <Form.Input
            defaultValue={section.name}
            required
            name="section_name"
            onChange={() => setContent(editor?.getHTML() || "")}
          />
        </Form.Field>
        <Form.Field>
          <Form.Label>Section Description</Form.Label>
          <Form.Input
            defaultValue={section.description}
            name="section_description"
            onChange={() => setContent(editor?.getHTML() || "")}
          />
        </Form.Field>
        <Form.Field>
          <Form.Label>Section Audio</Form.Label>
          <Form.Input
            name="audio"
            onChange={() => setContent(editor?.getHTML() || "")}
          />
        </Form.Field>
        <Form.Field className="mb-6">
          <Form.Label>Section Video</Form.Label>
          <Form.Input
            name="video"
            onChange={() => setContent(editor?.getHTML() || "")}
          />
        </Form.Field>
      </Form.FieldsContainer>
      {sectionType === "text" && (
        <Form.Field className="mb-5">
          <Form.Label>Section Content</Form.Label>
          <TipTapEditor editor={editor} />
        </Form.Field>
      )}
      {sectionType === "resources" && (
        <ResourceForm
          resources={resources}
          onAddResource={handleAddResource}
          onRemoveResource={handleRemoveResource}
        />
      )}
      {sectionType === "excercises" && (
        <>
          <QuestionList
            questions={questionsBySectionId[section._id] || []}
            onDeleteQuestion={deleteQuestionHandler}
          />
          <QuestionForm
            showQuestionDropdown={showQuestionDropdown}
            setShowQuestionDropdown={setShowQuestionDropdown}
            onAddQuestion={addQuestionHandler}
            onPasteQuestions={handlePasteContent}
          />
        </>
      )}
      <div className="flex gap-2 mt-32">
        <Button type="submit" onClick={() => setEditId(section._id)}>
          Save
        </Button>
        <Button onClick={onCopy} type="button">
          Copy Content
        </Button>
      </div>
    </Form>
  );
};

export default React.memo(SectionForm);
