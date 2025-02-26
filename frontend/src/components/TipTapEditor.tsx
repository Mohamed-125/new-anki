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

const MenuBar = React.memo(function MenuBar({
  editor,
}: {
  editor: Editor | null;
}) {
  if (!editor) return null;

  const buttonClass = (isActive: boolean) =>
    `p-2 rounded-lg transition-all ${
      isActive
        ? "bg-gray-800 text-white" // Active state
        : "bg-gray-100 hover:bg-gray-300 text-gray-800"
    }`;

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-100 border-b shadow-sm rounded-t-md">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive("bold"))}
      >
        <Bold size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive("italic"))}
      >
        <Italic size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={buttonClass(editor.isActive("strike"))}
      >
        <Strikethrough size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={buttonClass(editor.isActive("code"))}
      >
        <Code size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        className="p-2 text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-300"
      >
        <Eraser size={18} />
      </button>

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 1 }))}
      >
        <Heading size={18} />
        <span className="ml-1 text-xs font-bold">H1</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 2 }))}
      >
        <Heading size={18} />
        <span className="ml-1 text-xs font-bold">H2</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 3 }))}
      >
        <Heading size={18} />
        <span className="ml-1 text-xs font-bold">H3</span>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive("bulletList"))}
      >
        <List size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive("orderedList"))}
      >
        <ListOrdered size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={buttonClass(editor.isActive("blockquote"))}
      >
        <Quote size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-2 text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-300"
      >
        <Minus size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className="p-2 text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-300"
      >
        <Undo size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className="p-2 text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-300"
      >
        <Redo size={18} />
      </button>
    </div>
  );
});

export default ({ editor = null }: { editor: Editor | null }) => {
  return (
    <div className="overflow-hidden border rounded-md shadow-md ">
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className=" min-h-[200px] border-t  focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
};
