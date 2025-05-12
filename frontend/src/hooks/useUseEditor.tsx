import { Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useDeferredValue, useState, useEffect } from "react";
import { Extension } from "@tiptap/core";

// Custom extension to preserve HTML content with highlights
const PreserveHtmlExtension = Extension.create({
  name: "preserveHtml",

  addGlobalAttributes() {
    return [
      {
        types: ["span", "paragraph"],
        attributes: {
          class: {
            default: null,
            parseHTML: (element) => element.getAttribute("class"),
            renderHTML: (attributes) => {
              if (!attributes.class) return {};
              return { class: attributes.class };
            },
          },
          "data-id": {
            default: null,
            parseHTML: (element) => element.getAttribute("data-id"),
            renderHTML: (attributes) => {
              if (!attributes["data-id"]) return {};
              return { "data-id": attributes["data-id"] };
            },
          },
          "data-number": {
            default: null,
            parseHTML: (element) => element.getAttribute("data-number"),
            renderHTML: (attributes) => {
              if (!attributes["data-number"]) return {};
              return { "data-number": attributes["data-number"] };
            },
          },
          "data-text": {
            default: null,
            parseHTML: (element) => element.getAttribute("data-text"),
            renderHTML: (attributes) => {
              if (!attributes["data-text"]) return {};
              return { "data-text": attributes["data-text"] };
            },
          },
        },
      },
    ];
  },
});
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

import Document from "@tiptap/extension-document";
import Gapcursor from "@tiptap/extension-gapcursor";
import Paragraph from "@tiptap/extension-paragraph";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Text from "@tiptap/extension-text";

const useUseEditor = (readonly: boolean = false) => {
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
        HighlightMark,
        WordMark,
        Color,
        CustomImage,
        Link.configure({
          openOnClick: true,
          HTMLAttributes: {
            class: "text-blue-500 hover:text-blue-700 underline",
          },
        }),
        Document,
        Paragraph,
        Text,
        Gapcursor,
        PreserveHtmlExtension,
        Table.configure({
          resizable: true,
          handleWidth: 5,
          cellMinWidth: 100,
          HTMLAttributes: {
            class: "table-responsive",
          },
        }),
        TableRow,
        TableHeader,
        TableCell,
      ],
      content: deferredContent,
      editable: !readonly,
      shouldRerenderOnTransaction: false,
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
      console.log("content", content);
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

import { Mark } from "@tiptap/core";

export const HighlightMark = Mark.create({
  name: "highlight",

  addAttributes() {
    return {
      class: {
        default: "highlight",
      },
      "data-id": {
        default: null,
      },
      "data-number": {
        default: null,
      },
      "data-text": {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span.highlight",
        getAttrs: (dom: any) => ({
          class: dom.getAttribute("class"),
          "data-id": dom.getAttribute("data-id"),
          "data-number": dom.getAttribute("data-number"),
          "data-text": dom.getAttribute("data-text"),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },

  // This makes marks with different attributes not collapse into one
  addOptions() {
    return {
      ...this.parent?.(),
      inclusive: false,
      excludable: false,
      // This is key: make marks compare by attributes
      keepOnSplit: false,
    };
  },
});

export const WordMark = Mark.create({
  name: "word",

  addAttributes() {
    return {
      class: {
        default: "word", // or "relative word"
      },
      "data-number": {
        default: null,
      },
      "data-text": {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span.word, span.relative.word",
        getAttrs: (dom: HTMLElement) => ({
          class: dom.getAttribute("class"),
          "data-number": dom.getAttribute("data-number"),
          "data-text": dom.getAttribute("data-text"),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
});
