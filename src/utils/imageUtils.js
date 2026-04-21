/**
 * High-performance image compression using Canvas + WebP format.
 * WebP is ~30% smaller than JPEG at the same quality level.
 * Skips compression for already-small files to avoid unnecessary work.
 * 
 * @param {File} file The original image file.
 * @param {number} maxWidth Maximum width in pixels.
 * @param {number} quality Compression quality (0 to 1).
 * @returns {Promise<Blob>} Compressed image as a Blob.
 */
export const compressImage = (file, maxWidth = 900, quality = 0.65) => {
  return new Promise((resolve, reject) => {
    // Fast path: file is already small, skip compression
    if (file.size < 80 * 1024) { // < 80KB
      resolve(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl); // Free memory immediately

      let { width, height } = img;

      // Only scale down if larger than maxWidth
      if (width > maxWidth) {
        height = Math.round((maxWidth / width) * height);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Use WebP if supported (30% smaller than JPEG), fallback to JPEG
      const mimeType = canvas.toDataURL('image/webp').startsWith('data:image/webp')
        ? 'image/webp'
        : 'image/jpeg';

      canvas.toBlob(
        (blob) => {
          if (blob) {
            // If compressed is somehow LARGER than original, return original
            resolve(blob.size < file.size ? blob : file);
          } else {
            resolve(file);
          }
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback: use original on error
    };

    img.src = objectUrl;
  });
};
