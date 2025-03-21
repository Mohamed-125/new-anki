import { Editor, EditorContent, isActive, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect, useState } from "react";

import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Minus,
  Eraser,
} from "lucide-react";
import { color } from "framer-motion";

const MenuBar = function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const [color, setColor] = useState("#000000");

  // Function to add an image from a URL
  const addImageFromUrl = () => {
    const url = prompt("Enter Image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // Function to handle image pasting
  const handlePasteImage = async (event: ClipboardEvent) => {
    const clipboardItems = event.clipboardData?.items;
    if (!clipboardItems) return;

    for (const item of clipboardItems) {
      if (item.type.startsWith("image")) {
        event.preventDefault(); // Prevent default paste behavior
        const file = item.getAsFile();
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
          const imageUrl = reader.result as string;
          // Ensure editor maintains focus after inserting the image
          editor.chain().focus().setImage({ src: imageUrl }).focus().run();
        };
        reader.readAsDataURL(file);
        return; // Exit after handling the first image
      }
    }
  };

  // Attach event listener for pasting images
  useEffect(() => {
    if (!editor || !editor.view || !editor.view.dom) return;

    // Attach to the editor DOM element instead of document
    const editorElement = editor.view.dom;
    editorElement.addEventListener("paste", handlePasteImage);

    // Ensure the editor is focused when clicking anywhere in the editor area
    editorElement.addEventListener("click", () => {
      editor.commands.focus();
    });

    return () => {
      editorElement.removeEventListener("paste", handlePasteImage);
      editorElement.removeEventListener("click", () => {});
    };
  }, [editor]);

  const buttonClass = (isActive: boolean) =>
    `p-2 rounded-lg transition-all ${
      isActive
        ? "bg-gray-800 text-white" // Active state
        : "bg-gray-100 hover:bg-gray-300 text-gray-800"
    }`;

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-100 rounded-t-md border-b shadow-sm editor-menu">
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={addImageFromUrl}
        className="p-2 text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-300"
      >
        🖼️ Insert Image
      </button>

      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive("bold"))}
      >
        <Bold size={18} />
      </button>

      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive("italic"))}
      >
        <Italic size={18} />
      </button>
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={buttonClass(editor.isActive("strike"))}
      >
        <Strikethrough size={18} />
      </button>
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={buttonClass(editor.isActive("code"))}
      >
        <Code size={18} />
      </button>
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        className="p-2 text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-300"
      >
        <Eraser size={18} />
      </button>

      {/* Headings */}

      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 2 }))}
      >
        <Heading size={18} />
        <span className="ml-1 text-xs font-bold">H2</span>
      </button>
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 3 }))}
      >
        <Heading size={18} />
        <span className="ml-1 text-xs font-bold">H3</span>
      </button>

      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 4 }))}
      >
        <Heading size={18} />
        <span className="ml-1 text-xs font-bold">H4</span>
      </button>

      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive("bulletList"))}
      >
        <List size={18} />
      </button>
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive("orderedList"))}
      >
        <ListOrdered size={18} />
      </button>
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={buttonClass(editor.isActive("blockquote"))}
      >
        <Quote size={18} />
      </button>
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-2 text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-300"
      >
        <Minus size={18} />
      </button>
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className="p-2 text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-300"
      >
        <Undo size={18} />
      </button>
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className="p-2 text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-300"
      >
        <Redo size={18} />
      </button>
      <input
        type="color"
        list="presetColors"
        value={color}
        onChange={(e) => {
          setColor(e.target.value);
          editor.chain().focus().setColor(e.target.value).run();
        }}
        className="w-7 h-7 border cursor-pointer"
      />
      <datalist id="presetColors">
        <option>#4287f5</option>
        <option>#ff0000</option>
        <option>#04c22d</option>
        <option>#02f5e9</option>
        <option>#024ff5</option>
        <option>#8c02f5</option>
        <option>#f502e9</option>
        <option>#000000</option>
      </datalist>
    </div>
  );
};

export default ({ editor = null }: { editor: Editor | null }) => {
  return (
    <div className="overflow-hidden rounded-md border shadow-md tiptap-editor">
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className=" min-h-[200px] border-t  focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
};
