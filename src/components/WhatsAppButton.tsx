// src/components/WhatsAppButton.tsx
// ------------------------------------------------------------
// Floating WhatsApp button, fixed bottom-right on public pages.
// ------------------------------------------------------------

export default function WhatsAppButton({
  number,
  message,
}: {
  number: string;
  message?: string;
}) {
  const href = `https://wa.me/${number}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
    >
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M16 3C9.373 3 4 8.373 4 15c0 2.34.669 4.523 1.828 6.372L4 29l7.828-1.797A11.93 11.93 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3Z"
          fill="#25D366"
        />
        <path
          d="M22.472 18.294c-.336-.168-1.983-.978-2.291-1.09-.307-.112-.531-.168-.755.168-.223.336-.867 1.09-1.063 1.314-.196.223-.392.252-.727.084-.336-.168-1.42-.523-2.703-1.667-.999-.891-1.673-1.992-1.869-2.328-.196-.336-.021-.518.147-.685.151-.15.336-.392.503-.588.168-.196.223-.336.336-.559.112-.224.056-.42-.028-.588-.084-.168-.755-1.818-1.034-2.489-.272-.654-.549-.566-.755-.577-.196-.01-.42-.012-.643-.012-.224 0-.588.084-.895.42-.307.336-1.174 1.147-1.174 2.797s1.202 3.246 1.37 3.47c.168.223 2.366 3.612 5.733 5.065.801.346 1.426.552 1.913.707.804.256 1.536.22 2.115.133.645-.096 1.983-.81 2.263-1.594.28-.784.28-1.455.196-1.594-.084-.14-.307-.224-.643-.392Z"
          fill="#fff"
        />
      </svg>
    </a>
  );
}
