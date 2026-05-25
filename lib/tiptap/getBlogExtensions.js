"use client";

import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import Youtube from "@tiptap/extension-youtube";
import { ThumbnailImageExtension } from "./thumbnailImageExtension";
import { CalloutExtension } from "./calloutExtension";
import { FaqSectionExtension } from "./faqExtension";

export function getBlogExtensions({ editable = true } = {}) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
      horizontalRule: true,
      blockquote: true,
    }),
    Underline,
    Highlight.configure({ multicolor: false }),
    Link.configure({
      openOnClick: !editable,
      HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
    }),
    ThumbnailImageExtension.configure({ inline: false, allowBase64: false }),
    Table.configure({ resizable: editable }),
    TableRow,
    TableHeader,
    TableCell,
    Youtube.configure({
      width: 640,
      height: 360,
      HTMLAttributes: { class: "blog-youtube-embed" },
    }),
    CalloutExtension,
    FaqSectionExtension,
  ];
}
