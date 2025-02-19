import React, { useCallback, useDeferredValue, useRef } from "react";
import ReactQuill, { Quill } from "react-quill";
import { debounce } from "lodash";

const ReactQuillComponent = ({
  content,
  setContent,
  className,
  style,
  readOnly,
}: {
  content: string;
  setContent?: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
  style?: React.CSSProperties;
  readOnly?: boolean;
}) => {
  const quillRef = useRef(null);

  const imageHandler = useCallback(() => {
    //@ts-ignore
    const quillEditor = quillRef.current?.getEditor();
    const url = prompt("Please enter the image URL:");

    if (url && quillEditor) {
      quillEditor.focus();
      const range = quillEditor.getSelection();
      if (range) {
        quillEditor.insertEmbed(range.index, "image", url);
        quillEditor.setSelection(range.index + 1);
      } else {
        const length = quillEditor.getLength();
        quillEditor.insertEmbed(length - 1, "image", url);
        quillEditor.setSelection(length + 1);
      }
    }
  }, []);

  const modules = {
    toolbar: {
      container: [
        [{ header: [2, 3, 4, false] }],
        ["bold", "italic", "underline", "blockquote"],
        [{ color: [] }],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: imageHandler,
      },
    },

    clipboard: {
      matchVisual: true,
    },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "color",
    "clean",
  ];

  const changeHandler = debounce((newContent: string) => {
    setContent?.(newContent); // Debounced update to `content`
  }, 350);

  return (
    <ReactQuill
      theme="snow"
      className={className}
      formats={formats}
      modules={modules}
      style={style}
      value={content}
      readOnly={readOnly}
      onChange={changeHandler}
      ref={quillRef}
    />
  );
};

export default ReactQuillComponent;
