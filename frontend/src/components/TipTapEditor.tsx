import { Editor, EditorContent, isActive, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect, useState } from "react";
import { Extension } from "@tiptap/core";

// Custom extension to preserve HTML content
const PreserveHtmlExtension = Extension.create({
  name: "preserveHtml",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
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
        },
      },
    ];
  },

  addPasteRules() {
    return [
      {
        find: /(<span class="highlight"[^>]*>.*?<\/span>)/g,
        handler: ({ match, chain }) => {
          chain().insertContent(match[0]);
        },
      },
    ];
  },
});

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
  Table2,
  Columns,
  Trash2,
  Rows,
  MergeIcon,
  SplitIcon,
  Square,
  Merge,
  Wrench,
  ArrowRight,
  ArrowLeft,
  X,
  Link as LinkIcon,
} from "lucide-react";

import Document from "@tiptap/extension-document";
import Gapcursor from "@tiptap/extension-gapcursor";
import Paragraph from "@tiptap/extension-paragraph";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Text from "@tiptap/extension-text";

const MenuBar = function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const [color, setColor] = useState("#000000");
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkDialog(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

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
        title="Insert Image"
      >
        🖼️ Insert Image
      </button>

      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive("bold"))}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive("italic"))}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 2 }))}
        title="Heading 2"
      >
        <Heading size={18} />
      </button>
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive("bulletList"))}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive("orderedList"))}
        title="Ordered List"
      >
        <ListOrdered size={18} />
      </button>
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className="p-2 text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-300"
        title="Undo"
      >
        <Undo size={18} />
      </button>
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className="p-2 text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-300"
        title="Redo"
      >
        <Redo size={18} />
      </button>
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={buttonClass(editor.isActive("strike"))}
        title="Strikethrough"
      >
        <Strikethrough size={18} />
      </button>
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={buttonClass(editor.isActive("code"))}
        title="Code"
      >
        <Code size={18} />
      </button>
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => {
          const previousUrl = editor.getAttributes("link").href;
          setLinkUrl(previousUrl || "");
          setShowLinkDialog(true);
        }}
        className={buttonClass(editor.isActive("link"))}
        title="Add Link"
      >
        <LinkIcon size={18} />
      </button>
      {showLinkDialog && (
        <div className="absolute z-50 p-4 bg-white rounded-lg border border-gray-200 shadow-lg">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Enter URL"
            className="p-2 mb-2 w-full rounded border"
          />
          <div className="flex gap-2">
            <button
              onClick={addLink}
              className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Add
            </button>
            {editor.isActive("link") && (
              <button
                onClick={removeLink}
                className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600"
              >
                Remove
              </button>
            )}
            <button
              onClick={() => setShowLinkDialog(false)}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        className="p-2 text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-300"
        title="Clear Formatting"
      >
        <Eraser size={18} />
      </button>

      {/* Headings */}

      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 2 }))}
        title="Heading 2"
      >
        <Heading size={18} />
        <span className="ml-1 text-xs font-bold">H2</span>
      </button>
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 3 }))}
        title="Heading 3"
      >
        <Heading size={18} />
        <span className="ml-1 text-xs font-bold">H3</span>
      </button>

      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 4 }))}
        title="Heading 4"
      >
        <Heading size={18} />
        <span className="ml-1 text-xs font-bold">H4</span>
      </button>

      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={buttonClass(editor.isActive("blockquote"))}
        title="Blockquote"
      >
        <Quote size={18} />
      </button>
      <button
        style={{ perspective: "1px" }}
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-2 text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-300"
        title="Line"
      >
        <Minus size={18} />
      </button>

      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
        className={buttonClass(false)}
        title="Insert Table"
      >
        <Table2 size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().addColumnBefore().run()}
        className={buttonClass(false)}
        title="Add column before"
      >
        <Columns size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        className={buttonClass(false)}
        title="Add column after"
      >
        <Columns size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().deleteColumn().run()}
        className={buttonClass(false)}
        title="Delete column"
      >
        <Trash2 size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().addRowBefore().run()}
        className={buttonClass(false)}
        title="Add row before"
      >
        <Rows size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().addRowAfter().run()}
        className={buttonClass(false)}
        title="Add row after"
      >
        <Rows size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().deleteRow().run()}
        className={buttonClass(false)}
        title="Delete Row"
      >
        <Trash2 size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().deleteTable().run()}
        className={buttonClass(false)}
        title="Delete table"
      >
        <X size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().mergeCells().run()}
        className={buttonClass(false)}
        title="Merge cells"
      >
        <MergeIcon size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().splitCell().run()}
        className={buttonClass(false)}
        title="Split cell"
      >
        <SplitIcon size={18} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().splitCell().run()}
        className={buttonClass(false)}
        title="Split cell"
      >
        <SplitIcon size={18} />
      </button>

      <div className="flex gap-2 items-center">
        {/* Quick color buttons */}
        <div className="flex gap-1">
          {[
            { color: "#FF0000", label: "Red" },
            { color: "#0000FF", label: "Blue" },
            { color: "#00FF00", label: "Green" },
            { color: "#808080", label: "Gray" },
          ].map((colorOption) => (
            <button
              key={colorOption.color}
              type="button"
              onClick={() => {
                setColor(colorOption.color);
                editor.chain().focus().setColor(colorOption.color).run();
              }}
              className="w-6 h-6 rounded border border-gray-300 transition-all hover:scale-110"
              style={{ backgroundColor: colorOption.color }}
              title={colorOption.label}
            />
          ))}
          {color}
        </div>
      </div>

      <div className="relative group">
        <input
          type="color"
          list="presetColors"
          value={color}
          onChange={(e) => {
            const newColor = e.target.value;
            setColor(newColor);

            // Store the current selection
            const { from, to } = editor.state.selection;

            // First apply color to ensure it wraps all content
            editor.chain().focus().setColor(newColor).run();

            // If there's a selection, ensure formatting is preserved
            if (from !== to) {
              const marks = editor.state.doc.nodeAt(from)?.marks || [];

              // Reapply all existing marks except color
              marks.forEach((mark) => {
                if (mark.type.name !== "textStyle") {
                  editor.chain().setMark(mark.type.name).run();
                }
              });
            }
          }}
          className="w-10 h-10 rounded border-2 border-gray-300 transition-all cursor-pointer hover:border-blue-500"
        />
        <datalist id="presetColors">
          <option>#000000</option>
          <option>#434343</option>
          <option>#666666</option>
          <option>#999999</option>
          <option>#b7b7b7</option>
          <option>#cccccc</option>
          <option>#d9d9d9</option>
          <option>#efefef</option>
          <option>#f3f3f3</option>
          <option>#ffffff</option>
          <option>#980000</option>
          <option>#e60000</option>
          <option>#ff9900</option>
          <option>#ffff00</option>
          <option>#00ff00</option>
          <option>#00ffff</option>
          <option>#4a86e8</option>
          <option>#0000ff</option>
          <option>#9900ff</option>
          <option>#ff00ff</option>
          <option>#e6b8af</option>
          <option>#f4cccc</option>
          <option>#fce5cd</option>
          <option>#fff2cc</option>
          <option>#d9ead3</option>
          <option>#d0e0e3</option>
          <option>#c9daf8</option>
          <option>#cfe2f3</option>
          <option>#d9d2e9</option>
          <option>#ead1dc</option>
        </datalist>
      </div>
    </div>
  );
};

export default ({
  editor = null,
  onClick,
}: {
  editor: Editor | null;
  onClick?: any;
}) => {
  return (
    <div
      style={
        !editor?.isEditable
          ? {
              boxShadow: "none",
              border: "none",
              padding: "0px",
            }
          : {}
      }
      className="overflow-hidden rounded-md border shadow-md tiptap-editor"
    >
      {editor?.isEditable && <MenuBar editor={editor} />}
      <div className="overflow-x-auto">
        <EditorContent
          editor={editor}
          onClick={onClick ? onClick : undefined}
          className="max-h-[600px] min-h-[200px] border-t overflow-y-auto focus:ring-2 focus:ring-blue-400"
          style={
            {
              "--table-width": "100%",
              "--cell-min-width": "100px",
            } as React.CSSProperties
          }
        />
      </div>
      <style>{`
        .ProseMirror table {
          width: var(--table-width);
          border-collapse: collapse;
          margin: 0;
          overflow: hidden;
          table-layout: fixed;
        }
        .ProseMirror td,
        .ProseMirror th {
          min-width: var(--cell-min-width);
          border: 1px solid #ced4da;
          padding: 0.5rem;
          position: relative;
          vertical-align: top;
          box-sizing: border-box;
          word-wrap: break-word;
        }
        @media (max-width: 640px) {
          .ProseMirror table {
            font-size: 0.875rem;
          }
          .ProseMirror td,
          .ProseMirror th {
            padding: 0.375rem;
          }
        }
      `}</style>
    </div>
  );
};
