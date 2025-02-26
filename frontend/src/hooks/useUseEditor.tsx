import { Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useDeferredValue, useState } from "react";

const useUseEditor = () => {
  const [content, setContent] = useState("");

  const deferredContent = useDeferredValue(content);
  const editor = useEditor(
    {
      extensions: [StarterKit],
      content: deferredContent,
      shouldRerenderOnTransaction: false,
    },

    [deferredContent]
  );

  return { editor, setContent };
};

export default useUseEditor;
