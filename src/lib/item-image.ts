import type { CSSProperties } from "react";
import type { ItemImageCrop } from "@/lib/firebase/types";

export const DEFAULT_ITEM_IMAGE_CROP: ItemImageCrop = {
  aspect: "square",
  zoom: 1,
  focusX: 50,
  focusY: 50,
};

export const ITEM_IMAGE_ASPECT_OPTIONS: Array<{
  value: ItemImageCrop["aspect"];
  label: string;
}> = [
  { value: "square", label: "Square" },
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
  { value: "wide", label: "Wide" },
];

export function normalizeItemImageCrop(
  crop?: Partial<ItemImageCrop> | null,
): ItemImageCrop {
  return {
    aspect: crop?.aspect ?? DEFAULT_ITEM_IMAGE_CROP.aspect,
    zoom: Math.min(Math.max(crop?.zoom ?? DEFAULT_ITEM_IMAGE_CROP.zoom, 1), 2.5),
    focusX: Math.min(Math.max(crop?.focusX ?? DEFAULT_ITEM_IMAGE_CROP.focusX, 0), 100),
    focusY: Math.min(Math.max(crop?.focusY ?? DEFAULT_ITEM_IMAGE_CROP.focusY, 0), 100),
  };
}

export function getItemImageCropStyle(
  crop?: Partial<ItemImageCrop> | null,
): CSSProperties {
  const normalized = normalizeItemImageCrop(crop);

  return {
    objectPosition: `${normalized.focusX}% ${normalized.focusY}%`,
    transform: `scale(${normalized.zoom})`,
    transformOrigin: "center center",
  };
}

export function getItemImageAspectClass(
  crop?: Partial<ItemImageCrop> | null,
) {
  const normalized = normalizeItemImageCrop(crop);

  switch (normalized.aspect) {
    case "portrait":
      return "aspect-[4/5]";
    case "landscape":
      return "aspect-[5/4]";
    case "wide":
      return "aspect-[16/9]";
    default:
      return "aspect-square";
  }
}
