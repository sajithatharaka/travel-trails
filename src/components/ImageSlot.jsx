// src/components/ImageSlot.jsx
// ------------------------------------------------------------
// Renders a real photo when `src` is set in config.js, otherwise
// falls back to a labeled placeholder. See README "Photos" section
// for exactly where each image goes.
// ------------------------------------------------------------

import Image from "next/image";

export default function ImageSlot({
  src,
  alt,
  placeholder,
  shape = "rect",
  className = "",
  imgClassName = "",
  preload = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  quality,
}) {
  const shapeClass = shape === "circle" ? "rounded-full" : "";

  if (src) {
    return (
      <div className={`relative h-full w-full overflow-hidden ${shapeClass} ${className}`}>
        <Image
          src={src}
          alt={alt || placeholder || ""}
          fill
          preload={preload}
          sizes={sizes}
          quality={quality}
          className={`object-cover ${imgClassName}`}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-jungle to-deep-jungle text-center ${shapeClass} ${className}`}
    >
      <span className="px-4 text-xs font-medium leading-snug text-surface/70">
        {placeholder}
      </span>
    </div>
  );
}
