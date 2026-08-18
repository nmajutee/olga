import Image from "@tiptap/extension-image";
import { Node, mergeAttributes } from "@tiptap/core";

/**
 * Image with alignment and an explicit width, so the editor can offer the
 * placement choices people expect from WordPress. Both are rendered as plain
 * attributes that survive the HTML sanitiser and the public stylesheet.
 */
export const AlignedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center",
        parseHTML: (element) =>
          element.getAttribute("data-align") ??
          (element.className.match(/align-(\w+)/)?.[1] || "center"),
        renderHTML: (attributes) => ({
          "data-align": attributes.align,
          class: `align-${attributes.align}`,
        }),
      },
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) => (attributes.width ? { width: attributes.width } : {}),
      },
    };
  },
});

/**
 * A captioned image. The caption is editable inline — click it and type —
 * which is how the equivalent block behaves in WordPress.
 *
 * Uncaptioned images stay as plain <img> via AlignedImage; only images that
 * actually have a caption become figures, so the markup stays clean.
 */
export const FigureImage = Node.create({
  name: "figureImage",
  group: "block",
  content: "inline*",
  draggable: true,
  isolating: true,

  addAttributes() {
    // These belong on the inner <img>, so each one renders nothing on the
    // outer element. Without this, TipTap spreads them all onto the <figure>,
    // producing src/alt/width attributes on an element that has no such
    // attributes in HTML.
    return {
      src: { default: null, renderHTML: () => ({}) },
      alt: { default: "", renderHTML: () => ({}) },
      width: { default: null, renderHTML: () => ({}) },
      align: {
        default: "center",
        renderHTML: (attributes) => ({
          class: `align-${attributes.align ?? "center"}`,
          "data-align": attributes.align ?? "center",
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure",
        contentElement: "figcaption",
        getAttrs: (element) => {
          const image = (element as HTMLElement).querySelector("img");
          if (!image) return false;
          return {
            src: image.getAttribute("src"),
            alt: image.getAttribute("alt") ?? "",
            align:
              (element as HTMLElement).getAttribute("data-align") ??
              (element as HTMLElement).className.match(/align-(\w+)/)?.[1] ??
              "center",
            width: image.getAttribute("width"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { width, src, alt } = node.attrs as Record<string, string | null>;

    return [
      "figure",
      mergeAttributes(HTMLAttributes),
      ["img", { src, alt: alt ?? "", ...(width ? { width } : {}), loading: "lazy" }],
      ["figcaption", 0],
    ];
  },
});
