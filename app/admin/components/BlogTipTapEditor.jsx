"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Icon } from "@iconify/react";
import { getBlogExtensions } from "../../../lib/tiptap/getBlogExtensions";
import EmojiPickerPopover from "./EmojiPickerPopover";
import { useAppModal } from "../../../hooks/useAppModal";

function ToolbarButton({ active, onClick, title, children, disabled, label }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-sky-100 text-sky-700"
          : "text-appleGray-600 hover:bg-appleGray-100 hover:text-appleGray-900"
      } disabled:opacity-40`}
    >
      {children}
      {label && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-0.5 w-px self-stretch bg-appleGray-200" />;
}

function FaqEditorModal({ open, onClose, onInsert }) {
  const [items, setItems] = useState([
    { question: "", answer: "" },
    { question: "", answer: "" },
  ]);

  if (!open) return null;

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => setItems((prev) => [...prev, { question: "", answer: "" }]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-large">
        <h3 className="mb-4 text-lg font-bold text-appleGray-900">Insert FAQ section</h3>
        <div className="max-h-[50vh] space-y-4 overflow-y-auto">
          {items.map((item, index) => (
            <div key={index} className="rounded-xl border border-appleGray-200 p-3">
              <input
                type="text"
                placeholder="Question"
                value={item.question}
                onChange={(e) => updateItem(index, "question", e.target.value)}
                className="mb-2 w-full rounded-lg border border-appleGray-200 px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Answer"
                value={item.answer}
                onChange={(e) => updateItem(index, "answer", e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-appleGray-200 px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-3 text-sm font-medium text-sky-600 hover:text-sky-700"
        >
          + Add question
        </button>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-appleGray-200 px-4 py-2 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const valid = items.filter((i) => i.question.trim() && i.answer.trim());
              onInsert(valid.length ? valid : items);
              onClose();
            }}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Insert FAQ
          </button>
        </div>
      </div>
    </div>
  );
}

async function uploadEditorImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "content");
  const res = await fetch("/api/german-life-blog/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || "Upload failed");
  return json.url;
}

export default function BlogTipTapEditor({ value, onChange, fillHeight = false }) {
  const { showError } = useAppModal();
  const [faqOpen, setFaqOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const emojiButtonRef = useRef(null);

  const editor = useEditor({
    extensions: getBlogExtensions({ editable: true }),
    content: value || { type: "doc", content: [{ type: "paragraph" }] },
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange?.(ed.getJSON());
    },
    editorProps: {
      attributes: {
        class: fillHeight
          ? "blog-editor-prose blog-editor-prose-fill max-w-none px-4 py-4 focus:outline-none"
          : "blog-editor-prose min-h-[320px] max-w-none px-4 py-4 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor || value === undefined) return;
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(value);
    if (current !== incoming) {
      editor.commands.setContent(value || { type: "doc", content: [] }, false);
    }
  }, [editor, value]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("Link URL", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(
    async (display = "full") => {
      if (!editor) return;
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
          const url = await uploadEditorImage(file);
          editor
            .chain()
            .focus()
            .setImage({ src: url, display })
            .run();
        } catch (err) {
          showError(err.message || "Failed to upload image");
        } finally {
          setUploading(false);
        }
      };
      input.click();
    },
    [editor]
  );

  const addYoutube = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("YouTube URL");
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url });
  }, [editor]);

  const insertEmoji = useCallback(
    (emoji) => {
      if (!editor) return;
      editor.chain().focus().insertContent(emoji).run();
    },
    [editor]
  );

  if (!editor) {
    return (
      <div className="rounded-xl border border-appleGray-200 bg-appleGray-50 p-8 text-center text-appleGray-500">
        Loading editor...
      </div>
    );
  }

  const rootClass = fillHeight
    ? "flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-appleGray-200 bg-white"
    : "overflow-hidden rounded-xl border border-appleGray-200 bg-white";

  return (
    <div className={rootClass}>
      <FaqEditorModal
        open={faqOpen}
        onClose={() => setFaqOpen(false)}
        onInsert={(items) => editor.chain().focus().insertFaqSection(items).run()}
      />

      {/* Toolbar — always visible */}
      <div className="z-10 flex shrink-0 flex-wrap items-center gap-0.5 border-b border-appleGray-200 bg-white px-2 py-1.5">

        {/* Headings group */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4].map((level) => (
            <ToolbarButton
              key={level}
              title={`Heading ${level}`}
              active={editor.isActive("heading", { level })}
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            >
              <span className={`font-bold leading-none ${level === 1 ? "text-sm" : level === 2 ? "text-xs" : "text-[11px]"}`}>
                H{level}
              </span>
            </ToolbarButton>
          ))}
        </div>

        <ToolbarDivider />

        {/* Text format group */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            title="Bold (Ctrl+B)"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Icon icon="mdi:format-bold" className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Italic (Ctrl+I)"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Icon icon="mdi:format-italic" className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Underline (Ctrl+U)"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <Icon icon="mdi:format-underline" className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Highlight"
            active={editor.isActive("highlight")}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <Icon icon="mdi:format-color-highlight" className="h-4 w-4" />
          </ToolbarButton>
          <div className="relative" ref={emojiButtonRef}>
            <ToolbarButton
              title="Insert emoji"
              active={emojiOpen}
              onClick={() => setEmojiOpen((open) => !open)}
            >
              <Icon icon="mdi:emoticon-outline" className="h-4 w-4" />
            </ToolbarButton>
            <EmojiPickerPopover
              open={emojiOpen}
              onClose={() => setEmojiOpen(false)}
              onSelect={insertEmoji}
              anchorRef={emojiButtonRef}
            />
          </div>
        </div>

        <ToolbarDivider />

        {/* Lists & structure group */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            title="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <Icon icon="mdi:format-list-bulleted" className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Numbered list"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <Icon icon="mdi:format-list-numbered" className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Blockquote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Icon icon="mdi:format-quote-close" className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Link"
            active={editor.isActive("link")}
            onClick={setLink}
          >
            <Icon icon="mdi:link" className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Horizontal rule"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Icon icon="mdi:minus" className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        {/* Media & embeds group */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            title="Insert image"
            disabled={uploading}
            onClick={() => addImage("full")}
            label="Image"
          >
            <Icon icon="mdi:image-outline" className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Insert table"
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
            label="Table"
          >
            <Icon icon="mdi:table" className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Embed YouTube video"
            onClick={addYoutube}
            label="Video"
          >
            <Icon icon="mdi:youtube" className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        {/* Callouts & FAQ */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            title="Insert callout / note box"
            onClick={() => editor.chain().focus().insertCallout("note").run()}
            label="Callout"
          >
            <Icon icon="mdi:information-outline" className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Insert FAQ section"
            onClick={() => setFaqOpen(true)}
            label="FAQ"
          >
            <Icon icon="mdi:frequently-asked-questions" className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {uploading && (
          <span className="ml-auto text-xs text-sky-600">Uploading…</span>
        )}
      </div>

      {fillHeight ? (
        <div className="blog-editor-scroll min-h-0 flex-1 overflow-y-auto admin-main-scroll">
          <EditorContent editor={editor} />
        </div>
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}
