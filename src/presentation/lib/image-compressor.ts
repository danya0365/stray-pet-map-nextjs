/**
 * Image compressor — client-side Canvas-based
 * Mirrors server-side sharp behavior (2048px, JPEG 85%, <2MB)
 * Production-ready for iPhone HEIC/JPEG (5–10MB+) upload
 */

const MAX_DIMENSION = 2048;
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const INITIAL_QUALITY = 0.85;

export async function compressImage(
  file: File | Blob,
  contentType = "image/jpeg",
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate new dimensions (fit inside MAX_DIMENSION)
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Canvas context not available"));
      }

      // Use better quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const tryQuality = (quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Canvas toBlob failed"));
            }

            if (blob.size <= MAX_SIZE_BYTES || quality <= 0.6) {
              return resolve(blob);
            }

            // Still too big, lower quality and retry
            const nextQuality = Math.max(0.6, quality - 0.1);
            tryQuality(nextQuality);
          },
          contentType,
          quality,
        );
      };

      tryQuality(INITIAL_QUALITY);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = url;
  });
}
