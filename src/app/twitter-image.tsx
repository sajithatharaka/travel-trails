// Twitter card image — identical to the Open Graph image.
// Keeping a distinct file means `twitter:image` is emitted explicitly
// rather than relying on Twitter's silent fall-through to `og:image`.
export { default, alt, size, contentType } from "./opengraph-image";
