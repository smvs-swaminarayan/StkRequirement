"use client";

import { useEffect, useMemo, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { Modal } from "@/components/ui/modal";
import type { ItemImageCrop } from "@/lib/firebase/types";
import {
  getItemImageCropStyle,
  ITEM_IMAGE_ASPECT_OPTIONS,
  normalizeItemImageCrop,
} from "@/lib/item-image";

interface ImageCropEditorProps {
  imageUrl: string;
  crop: ItemImageCrop;
  onChange: (crop: ItemImageCrop) => void;
  onRemove: () => void;
}

const ASPECT_MAP: Record<string, number> = {
  square: 1,
  portrait: 3 / 4,
  landscape: 4 / 3,
  wide: 16 / 9,
};

export function ImageCropEditor({ imageUrl, crop, onChange, onSave: onSaveProp, onRemove }: ImageCropEditorProps) {
  const normalizedCrop = useMemo(() => normalizeItemImageCrop(crop), [crop]);
  const [open, setOpen] = useState(false);

  const [draftAspect, setDraftAspect] = useState<ItemImageCrop["aspect"]>(normalizedCrop.aspect);
  const [draftZoom, setDraftZoom] = useState(normalizedCrop.zoom);
  const [draftPosition, setDraftPosition] = useState<Point>({
    x: (normalizedCrop.focusX - 50) * 2,
    y: (normalizedCrop.focusY - 50) * 2,
  });
  const [draftFocus, setDraftFocus] = useState({ x: normalizedCrop.focusX, y: normalizedCrop.focusY });

  const aspectRatio = ASPECT_MAP[draftAspect] ?? 1;

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraftAspect(normalizedCrop.aspect);
    setDraftZoom(normalizedCrop.zoom);
    setDraftPosition({
      x: (normalizedCrop.focusX - 50) * 2,
      y: (normalizedCrop.focusY - 50) * 2,
    });
    setDraftFocus({ x: normalizedCrop.focusX, y: normalizedCrop.focusY });
  }, [normalizedCrop, open]);

  const onCropComplete = (_croppedArea: Area, _croppedAreaPixels: Area) => {
    const focusX = Math.min(100, Math.max(0, 50 + draftPosition.x / 2));
    const focusY = Math.min(100, Math.max(0, 50 + draftPosition.y / 2));
    setDraftFocus({ x: focusX, y: focusY });
  };

  const onSave = () => {
    onChange(
      normalizeItemImageCrop({
        aspect: draftAspect,
        zoom: draftZoom,
        focusX: draftFocus.x,
        focusY: draftFocus.y,
      }),
    );
    setOpen(false);
  };

  return (
    <>
      <div className="rounded-[20px] border border-[var(--border)] bg-white/76 p-4">
        <div className="grid gap-3 md:grid-cols-[140px_1fr]">
          <div className="overflow-hidden rounded-[16px] border border-[var(--border)] bg-[var(--paper)]">
            <div className="aspect-square">
              <img
                src={imageUrl}
                alt="Preview"
                className="h-full w-full object-cover"
                style={getItemImageCropStyle(normalizedCrop)}
              />
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">Crop</p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">
                Tap “Edit crop” to open the advanced cropper in a popup.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setOpen(true)} className="btn-action">
                Edit crop
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange(
                    normalizeItemImageCrop({
                      aspect: normalizedCrop.aspect,
                      zoom: 1,
                      focusX: 50,
                      focusY: 50,
                    }),
                  )
                }
                className="btn-secondary"
              >
                Reset
              </button>
              <button type="button" onClick={onRemove} className="btn-secondary text-[var(--danger)]">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Crop image"
        description="Drag to move • Scroll/pinch to zoom • Choose shape • Save when done"
      >
        <div className="grid gap-4">
          <div className="relative h-[42vh] sm:h-[52vh] overflow-hidden rounded-[18px] border border-[var(--border)] bg-black/5">
            <Cropper
              image={imageUrl}
              crop={draftPosition}
              zoom={draftZoom}
              aspect={aspectRatio}
              onCropChange={setDraftPosition}
              onZoomChange={setDraftZoom}
              onCropComplete={onCropComplete}
              minZoom={1}
              maxZoom={3}
              objectFit="contain"
              showGrid
              zoomWithScroll
            />
          </div>

          <div className="grid gap-3 rounded-[18px] border border-[var(--border)] bg-[var(--paper)] p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm font-semibold text-[var(--ink)]">
                Shape
                <div className="mt-2 flex flex-wrap gap-2">
                  {ITEM_IMAGE_ASPECT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDraftAspect(option.value)}
                      className={
                        draftAspect === option.value
                          ? "rounded-[12px] border border-[var(--primary)] bg-[var(--primary-soft)] px-3 py-2 text-sm font-semibold text-[var(--primary-dark)]"
                          : "rounded-[12px] border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--canvas)]"
                      }
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </label>

              <div className="text-sm font-semibold text-[var(--ink)]">
                Zoom
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="rounded-[12px] border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--canvas)]"
                    onClick={() => setDraftZoom((z) => Math.max(1, Number((z - 0.1).toFixed(2))))}
                    aria-label="Zoom out"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    className="rounded-[12px] border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--canvas)]"
                    onClick={() => setDraftZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}
                    aria-label="Zoom in"
                  >
                    +
                  </button>
                  <span className="text-[11px] font-semibold text-[var(--ink-soft)]">
                    Pinch (mobile) / scroll (desktop) to zoom
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setDraftZoom(1);
                  setDraftPosition({ x: 0, y: 0 });
                  setDraftFocus({ x: 50, y: 50 });
                }}
              >
                Reset
              </button>
              <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn-action" onClick={onSave}>
                Save crop
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
