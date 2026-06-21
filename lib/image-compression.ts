/**
 * Kompresi gambar sisi klien menggunakan HTML5 Canvas.
 * Mengubah dimensi gambar secara proporsional dan mengekspornya ke format WebP untuk menghemat storage.
 */
export async function compressImage(
  file: File,
  maxDimension = 1200,
  quality = 0.8
): Promise<File> {
  // Hanya kompres jika tipe file adalah gambar
  if (!file.type.startsWith("image/")) {
    return file
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        // Ubah ukuran secara proporsional
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          resolve(file)
          return
        }

        // Gambar ulang di canvas
        ctx.drawImage(img, 0, 0, width, height)

        // Konversi canvas ke blob WebP dengan tingkat kualitas yang ditentukan
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file)
              return
            }

            // Ubah nama file menjadi .webp
            const dotIndex = file.name.lastIndexOf(".")
            const baseName = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name
            
            const compressedFile = new File([blob], `${baseName}_compressed.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            })

            resolve(compressedFile)
          },
          "image/webp",
          quality
        )
      }

      img.onerror = () => {
        resolve(file)
      }

      img.src = event.target?.result as string
    }

    reader.onerror = () => {
      resolve(file)
    }

    reader.readAsDataURL(file)
  })
}
