"use client";

import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";

function FaqNodeView({ node }) {
  const items = node.attrs.items || [];

  return (
    <NodeViewWrapper className="blog-faq-section my-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-600">
        FAQ section
      </p>
      {items.map((item, index) => (
        <div key={index} className="blog-faq-item border-t border-appleGray-200 first:border-t-0">
          <p className="blog-faq-question">{item.question}</p>
          <p className="blog-faq-answer">{item.answer}</p>
        </div>
      ))}
    </NodeViewWrapper>
  );
}

export const FaqSectionExtension = Node.create({
  name: "faqSection",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      items: {
        default: [{ question: "Question?", answer: "Answer goes here." }],
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute("data-items") || "[]");
          } catch {
            return [{ question: "Question?", answer: "Answer goes here." }];
          }
        },
        renderHTML: (attrs) => ({
          "data-items": JSON.stringify(attrs.items || []),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="faq"]' }];
  },

  renderHTML({ node }) {
    const items = node.attrs.items || [];
    return [
      "div",
      {
        "data-type": "faq",
        class: "blog-faq-section",
        "data-items": JSON.stringify(items),
      },
      ...items.flatMap((item) => [
        [
          "div",
          { class: "blog-faq-item" },
          [
            ["h4", { class: "blog-faq-question" }, item.question || ""],
            ["p", { class: "blog-faq-answer" }, item.answer || ""],
          ],
        ],
      ]),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FaqNodeView);
  },

  addCommands() {
    return {
      insertFaqSection:
        (items) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              items: items || [
                { question: "Question?", answer: "Answer goes here." },
              ],
            },
          }),
    };
  },
});
