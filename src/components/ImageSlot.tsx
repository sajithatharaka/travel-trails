// src/components/ImageSlot.tsx
// ------------------------------------------------------------
// Renders a real photo when `src` is set, otherwise falls back to a
// labeled placeholder (or initials, for avatars).
// ------------------------------------------------------------

import Image from "next/image";

type ImageSlotProps = {
  src?: string | null;
  alt?: string;
  placeholder?: string;
  initials?: string;
  shape?: "rect" | "circle";
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
};

export default function ImageSlot({
  src,
  alt,
  placeholder,
  initials,
  shape = "rect",
  className = "",
  imgClassName = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  quality,
}: ImageSlotProps) {
  const shapeClass = shape === "circle" ? "rounded-full" : "";

  if (src) {
    return (
      <div
        className={`relative h-full w-full overflow-hidden ${shapeClass} ${className}`}
      >
        <Image
          src={src}
          alt={alt || placeholder || ""}
          fill
          priority={priority}
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
      <span
        className={
          initials
            ? "text-sm font-semibold tracking-wide text-surface/90"
            : "px-4 text-xs font-medium leading-snug text-surface/70"
        }
      >
        {initials || placeholder}
      </span>
    </div>
  );
}
