import { Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useDeferredValue, useState } from "react";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";

const useUseEditor = () => {
  const [content, setContent] = useState("");

  const CustomTextStyle = TextStyle.extend({
    addAttributes() {
      return {
        style: {
          default: null,
          parseHTML: (element) => element.getAttribute("style"),
          renderHTML: (attributes) => {
            return attributes.style ? { style: attributes.style } : {};
          },
        },
      };
    },
  });

  const deferredContent = useDeferredValue(content);

  const editor = useEditor(
    {
      extensions: [StarterKit, CustomTextStyle, Color, Image], // Added Image extension
      content: deferredContent,
    },
    [deferredContent]
  );

  return { editor, setContent };
};

export default useUseEditor;
