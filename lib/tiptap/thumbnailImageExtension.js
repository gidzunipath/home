import Image from "@tiptap/extension-image";

export const ThumbnailImageExtension = Image.extend({
  name: "image",

  addAttributes() {
    return {
      ...this.parent?.(),
      display: {
        default: "full",
        parseHTML: (el) => el.getAttribute("data-display") || "full",
        renderHTML: (attrs) => ({
          "data-display": attrs.display,
          class:
            attrs.display === "thumbnail"
              ? "blog-image-thumbnail"
              : "blog-image-full",
        }),
      },
    };
  },
});
