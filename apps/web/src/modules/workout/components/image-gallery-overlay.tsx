import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ImageGalleryOverlayProps {
  images: string[];
  onClose: () => void;
}

export function ImageGalleryOverlay({
  images,
  onClose,
}: ImageGalleryOverlayProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Lock body scroll & listen for Escape
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-observe when images change
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = itemRefs.current.indexOf(
              entry.target as HTMLDivElement,
            );
            if (idx !== -1) setActiveIndex(idx);
          }
        }
      },
      { root: container, threshold: 0.5 },
    );

    for (const item of itemRefs.current) {
      if (item) observer.observe(item);
    }

    return () => observer.disconnect();
  }, [images.length]);

  const setItemRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      itemRefs.current[index] = el;
    },
    [],
  );

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex flex-1 snap-x snap-mandatory overflow-x-auto scrollbar-none"
      >
        {images.map((src, i) => (
          <div
            key={src}
            ref={setItemRef(i)}
            className="flex w-screen shrink-0 snap-center items-center justify-center"
          >
            <img
              src={`${import.meta.env.VITE_IMAGE_URL}${src}`}
              alt=""
              className="max-h-[70vh] max-w-full object-contain"
            />
          </div>
        ))}
      </div>

      {/* Dots + Close */}
      <div className="flex flex-col items-center gap-4 pb-10 pt-4">
        {images.length > 1 && (
          <div className="flex gap-2">
            {images.map((src, i) => (
              <span
                key={src}
                className={`size-2 rounded-full transition-opacity ${
                  i === activeIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          className="flex size-12 items-center justify-center rounded-full bg-white/10"
        >
          <X className="size-6 text-white" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
