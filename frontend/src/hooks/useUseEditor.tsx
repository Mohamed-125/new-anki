import { Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useDeferredValue, useState } from "react";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

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
      extensions: [StarterKit, CustomTextStyle, Color],

      content: deferredContent,
      editorProps: {
        handlePaste(view, event) {
          const items = event.clipboardData?.items;
          if (items) {
            for (let item of items) {
              if (item.type.startsWith("image/")) {
                const file = item.getAsFile();
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const src = reader.result;
                    if (typeof src === "string") {
                      view.dispatch(
                        //@ts-ignore
                        view.state.tr.insertInline(
                          view.state.selection.from,
                          view.state.schema.nodes.image.create({ src })
                        )
                      );
                    }
                  };
                  reader.readAsDataURL(file);
                }
                event.preventDefault();
                return true;
              }
            }
          }
          return false;
        },
      },
      // shouldRerenderOnTransaction: false,
    },

    [deferredContent]
  );

  return { editor, setContent };
};

export default useUseEditor;
