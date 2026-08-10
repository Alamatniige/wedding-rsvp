import { createServerFn } from '@tanstack/react-start'
import type { UploadWeddingPhotoInput } from './schema'

function validateUpload(data: unknown): UploadWeddingPhotoInput {
  if (!data || typeof data !== 'object') {
    throw new Error('Photo details are required.')
  }
  const value = data as Record<string, unknown>
  if (typeof value.guestId !== 'string' || !value.guestId.trim()) {
    throw new Error('Guest id is required.')
  }
  if (typeof value.dataUrl !== 'string' || !value.dataUrl.startsWith('data:')) {
    throw new Error('Photo data is required.')
  }
  const capturedAt =
    typeof value.capturedAt === 'string' && value.capturedAt.length > 0
      ? value.capturedAt
      : null
  return {
    guestId: value.guestId.trim(),
    dataUrl: value.dataUrl,
    capturedAt,
  }
}

export const uploadWeddingPhoto = createServerFn({ method: 'POST' })
  .validator(validateUpload)
  .handler(async ({ data }) => {
    const { uploadWeddingDayPhoto } = await import('./operations.server')
    return uploadWeddingDayPhoto(data)
  })

export const listAdminPhotos = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { listAdminWeddingPhotos } = await import('./operations.server')
    return listAdminWeddingPhotos()
  },
)
