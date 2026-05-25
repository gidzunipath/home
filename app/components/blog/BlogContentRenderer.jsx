"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import { getBlogExtensions } from "../../../lib/tiptap/getBlogExtensions";

export default function BlogContentRenderer({ content }) {
  const editor = useEditor({
    extensions: getBlogExtensions({ editable: false }),
    content: content || { type: "doc", content: [] },
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "blog-prose max-w-none",
      },
    },
  });

  useEffect(() => {
    if (!editor || !content) return;
    editor.commands.setContent(content, false);
  }, [editor, content]);

  if (!editor) return null;

  return <EditorContent editor={editor} />;
}
