import { Node, mergeAttributes } from "@tiptap/core";

export const CalloutExtension = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: "note",
        parseHTML: (el) => el.getAttribute("data-variant") || "note",
        renderHTML: (attrs) => ({ "data-variant": attrs.variant }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }, { tag: 'div[data-callout]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "callout",
        class: `blog-callout blog-callout-${HTMLAttributes.variant || HTMLAttributes["data-variant"] || "note"}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (variant = "note") =>
        ({ commands }) =>
          commands.wrapIn(this.name, { variant }),
      insertCallout:
        (variant = "note") =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { variant },
            content: [{ type: "paragraph" }],
          }),
    };
  },
});
