import { requireAdmin } from '#/lib/supabase/admin-auth.server'
import { createSupabaseAdminClient } from '#/lib/supabase/server'
import {
  MAX_PHOTOS_PER_GUEST,
  WEDDING_DAY_PHOTOS_BUCKET,
  type UploadWeddingPhotoInput,
  type WeddingDayPhotoRecord,
} from './schema'

type PhotoRow = {
  id: string
  guest_id: string
  storage_path: string
  captured_at: string | null
  created_at: string
}

type GuestJoin = {
  first_name: string
  last_name: string
}

type PhotoRowWithGuest = PhotoRow & {
  rsvps: GuestJoin | GuestJoin[] | null
}

function guestLabelFromJoin(join: PhotoRowWithGuest['rsvps']): string {
  const guest = Array.isArray(join) ? join[0] : join
  if (!guest) return 'Guest'
  const name = `${guest.first_name} ${guest.last_name}`.trim()
  return name || 'Guest'
}

function parseDataUrl(dataUrl: string): { bytes: Buffer; contentType: string } {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl.trim())
  if (!match) {
    throw new Error('Photo payload must be a base64 data URL.')
  }
  const contentType = match[1]?.trim() || 'image/jpeg'
  if (!contentType.startsWith('image/')) {
    throw new Error('Only image uploads are allowed.')
  }
  const bytes = Buffer.from(match[2] ?? '', 'base64')
  if (bytes.length === 0) {
    throw new Error('Photo payload is empty.')
  }
  if (bytes.length > 5 * 1024 * 1024) {
    throw new Error('Photo is too large (max 5MB).')
  }
  return { bytes, contentType }
}

function extensionForContentType(contentType: string): string {
  if (contentType.includes('png')) return 'png'
  if (contentType.includes('webp')) return 'webp'
  return 'jpg'
}

export async function uploadWeddingDayPhoto(
  input: UploadWeddingPhotoInput,
): Promise<{ id: string; capped: boolean }> {
  const guestId = input.guestId.trim()
  if (!guestId) throw new Error('Guest id is required.')

  const supabase = createSupabaseAdminClient()

  const guestLookup = await supabase
    .from('rsvps')
    .select('id')
    .eq('id', guestId)
    .maybeSingle()
  if (guestLookup.error) throw new Error('Could not verify guest.')
  if (!guestLookup.data) throw new Error('Guest was not found.')

  const countResult = await supabase
    .from('wedding_day_photos')
    .select('id', { count: 'exact', head: true })
    .eq('guest_id', guestId)
  if (countResult.error) throw new Error('Could not check photo limit.')
  if ((countResult.count ?? 0) >= MAX_PHOTOS_PER_GUEST) {
    return { id: '', capped: true }
  }

  const { bytes, contentType } = parseDataUrl(input.dataUrl)
  const photoId = crypto.randomUUID()
  const ext = extensionForContentType(contentType)
  const storagePath = `${guestId}/${photoId}.${ext}`

  const upload = await supabase.storage
    .from(WEDDING_DAY_PHOTOS_BUCKET)
    .upload(storagePath, bytes, {
      contentType,
      upsert: false,
    })
  if (upload.error) {
    throw new Error('Could not upload this photo.')
  }

  const insert = await supabase
    .from('wedding_day_photos')
    .insert({
      id: photoId,
      guest_id: guestId,
      storage_path: storagePath,
      captured_at: input.capturedAt,
    })
    .select('id')
    .single()

  if (insert.error) {
    await supabase.storage.from(WEDDING_DAY_PHOTOS_BUCKET).remove([storagePath])
    throw new Error('Could not save this photo.')
  }

  return { id: insert.data.id as string, capped: false }
}

export async function listAdminWeddingPhotos(): Promise<
  WeddingDayPhotoRecord[]
> {
  await requireAdmin()
  const supabase = createSupabaseAdminClient()

  const result = await supabase
    .from('wedding_day_photos')
    .select(
      'id, guest_id, storage_path, captured_at, created_at, rsvps(first_name, last_name)',
    )
    .order('captured_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (result.error) throw new Error('Could not load gallery photos.')

  const rows = (result.data ?? []) as PhotoRowWithGuest[]
  if (rows.length === 0) return []

  const paths = rows.map((row) => row.storage_path)
  const signed = await supabase.storage
    .from(WEDDING_DAY_PHOTOS_BUCKET)
    .createSignedUrls(paths, 60 * 60)

  if (signed.error) throw new Error('Could not prepare photo links.')

  const urlByPath = new Map<string, string>()
  for (const item of signed.data ?? []) {
    if (item.path && item.signedUrl) {
      urlByPath.set(item.path, item.signedUrl)
    }
  }

  return rows
    .map((row) => {
      const url = urlByPath.get(row.storage_path)
      if (!url) return null
      return {
        id: row.id,
        guestId: row.guest_id,
        guestLabel: guestLabelFromJoin(row.rsvps),
        storagePath: row.storage_path,
        url,
        capturedAt: row.captured_at,
        createdAt: row.created_at,
      } satisfies WeddingDayPhotoRecord
    })
    .filter((row): row is WeddingDayPhotoRecord => row !== null)
}
