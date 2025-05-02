import { Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useDeferredValue, useState, useEffect } from "react";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";

import Document from "@tiptap/extension-document";
import Gapcursor from "@tiptap/extension-gapcursor";
import Paragraph from "@tiptap/extension-paragraph";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Text from "@tiptap/extension-text";
import { EditorContent } from "@tiptap/react";

const useUseEditor = (readonly: boolean = false) => {
  const [content, setContent] = useState("");

  console.log(!readonly);
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

  // Configure Image extension to properly handle data URLs
  const CustomImage = Image.configure({
    inline: true,
    allowBase64: true, // Explicitly allow base64/data URLs
  });

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        CustomTextStyle,
        Color,
        CustomImage,
        Document,
        Paragraph,
        Text,
        Gapcursor,
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
      ],
      content: deferredContent,
      editable: !readonly,
      // Ensure images are properly parsed and rendered
      parseOptions: {
        preserveWhitespace: "full",
      },
    },
    [deferredContent, readonly]
  );

  // Force editor to update when content changes
  useEffect(() => {
    if (editor && content) {
      // Small delay to ensure editor is ready
      const timer = setTimeout(() => {
        editor.commands.setContent(content);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [editor, content]);

  return { editor, setContent };
};

export default useUseEditor;
