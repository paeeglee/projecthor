import { useState } from "react";
import { ImageGalleryOverlay } from "./image-gallery-overlay";

interface ExercisePreviewCardProps {
  exerciseName: string;
  images: string[];
  sets: number;
  reps: number;
  lastSession: Array<{ reps: number; weight: number }> | null;
}

export function ExercisePreviewCard({
  exerciseName,
  images,
  sets,
  reps,
  lastSession,
}: ExercisePreviewCardProps) {
  const [showGallery, setShowGallery] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={images.length > 0 ? () => setShowGallery(true) : undefined}
        className="w-full rounded-xl bg-surface p-4 text-left"
      >
        <div className="flex items-center gap-3">
          {images[0] ? (
            <img
              src={`${import.meta.env.VITE_IMAGE_URL}${images[0]}`}
              alt={exerciseName}
              className="size-14 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="size-14 shrink-0 rounded-lg bg-surface-light" />
          )}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white">{exerciseName}</h3>
            <span className="text-xs text-text-muted">
              {sets} x {reps}
            </span>
          </div>
        </div>

        {lastSession && lastSession.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Última sessão
            </p>
            <div className="grid grid-cols-[1.5rem_1fr_1fr] gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              <span>#</span>
              <span>Reps</span>
              <span>Carga</span>
            </div>
            {lastSession.map((set, i) => (
              <div
                key={i}
                className="grid grid-cols-[1.5rem_1fr_1fr] items-center gap-2"
              >
                <span className="text-sm text-text-muted">{i + 1}</span>
                <span className="text-sm text-white">{set.reps}</span>
                <span className="text-sm text-white">{set.weight} kg</span>
              </div>
            ))}
          </div>
        )}
      </button>

      {showGallery && images.length > 0 && (
        <ImageGalleryOverlay
          images={images}
          onClose={() => setShowGallery(false)}
        />
      )}
    </>
  );
}
