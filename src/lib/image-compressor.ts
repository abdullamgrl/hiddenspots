/**
 * Compresses an image file on the client side using Canvas,
 * converting it to optimized WebP format.
 * 
 * @param file The original upload file
 * @param maxWidth The maximum width constraint
 * @param maxHeight The maximum height constraint
 * @param quality Compression quality (0 to 1)
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Whitelist check
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      resolve(file) // Skip compression for unsupported types
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new window.Image()
      img.src = event.target?.result as string

      img.onload = () => {
        let width = img.width
        let height = img.height

        // Constrain dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to acquire canvas context'))
          return
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to generate image blob'))
              return
            }
            const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: 'image/webp',
              lastModified: Date.now(),
            })
            resolve(webpFile)
          },
          'image/webp',
          quality
        )
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}
