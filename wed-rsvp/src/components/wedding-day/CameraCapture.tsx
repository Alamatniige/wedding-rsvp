import { useCallback, useEffect, useRef, useState } from 'react'
import type { TouchEvent, TouchList } from 'react'
import { Flashlight, FlashlightOff, Images, SwitchCamera } from 'lucide-react'
import { Button } from '../ui/button'
import { appendPhoto, MAX_PHOTOS_PER_GUEST, readPhotos } from './storage'
import type { WeddingDayPhoto, WeddingDaySession } from './storage'

type FacingMode = 'user' | 'environment'

type CameraCaptureProps = {
  session: WeddingDaySession
  onPhotoSaved: (photoCount: number) => void
  onViewPostCapture: () => void
}

const MIN_ZOOM = 1
const MAX_ZOOM = 3

declare global {
  interface Window {
    ImageCapture?: new (track: MediaStreamTrack) => {
      takePhoto: () => Promise<Blob>
    }
  }
}

export default function CameraCapture({
  session,
  onPhotoSaved,
  onViewPostCapture,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const pinchStartDist = useRef<number | null>(null)
  const pinchStartZoom = useRef(1)

  const [facing, setFacing] = useState<FacingMode>('user')
  const [zoom, setZoom] = useState(1)
  const [photos, setPhotos] = useState<WeddingDayPhoto[]>(() =>
    readPhotos(session.guestId),
  )
  const [error, setError] = useState<string | null>(null)
  const [freezing, setFreezing] = useState(false)
  const [freezeFrame, setFreezeFrame] = useState<string | null>(null)
  const [flyingPhoto, setFlyingPhoto] = useState<string | null>(null)
  const [starting, setStarting] = useState(true)
  const [torchSupported, setTorchSupported] = useState(false)
  const [torchOn, setTorchOn] = useState(false)

  const remaining = MAX_PHOTOS_PER_GUEST - photos.length
  const atCap = remaining <= 0
  const latestPhoto = photos.at(-1)

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => {
      try {
        void track.applyConstraints({
          advanced: [{ torch: false } as MediaTrackConstraintSet],
        })
      } catch {
        // unsupported or already stopped
      }
      track.stop()
    })
    streamRef.current = null
    setTorchOn(false)
    setTorchSupported(false)
  }, [])

  const probeTorch = useCallback((track: MediaStreamTrack | undefined) => {
    if (!track) {
      setTorchSupported(false)
      setTorchOn(false)
      return
    }
    const getCaps = (
      track as unknown as {
        getCapabilities?: () => Record<string, unknown>
      }
    ).getCapabilities
    const caps = getCaps?.call(track)
    const supported = caps?.torch === true
    setTorchSupported(supported)
    if (!supported) setTorchOn(false)
  }, [])

  const startCamera = useCallback(
    async (mode: FacingMode) => {
      setStarting(true)
      setError(null)
      setTorchOn(false)
      stopStream()
      try {
        let stream: MediaStream
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: { exact: mode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          })
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: { ideal: mode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          })
        }
        streamRef.current = stream
        const track = stream.getVideoTracks()[0]
        probeTorch(track)
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          await video.play()
        }
      } catch {
        setError(
          'Camera access was denied or is unavailable. Check permissions and try again.',
        )
        setTorchSupported(false)
      } finally {
        setStarting(false)
      }
    },
    [probeTorch, stopStream],
  )

  useEffect(() => {
    void startCamera(facing)
    return () => {
      stopStream()
    }
  }, [facing, startCamera, stopStream])

  useEffect(() => {
    setPhotos(readPhotos(session.guestId))
  }, [session.guestId])

  async function setTorch(enabled: boolean) {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track || !torchSupported) return
    try {
      await track.applyConstraints({
        advanced: [{ torch: enabled } as MediaTrackConstraintSet],
      })
      setTorchOn(enabled)
    } catch {
      setTorchOn(false)
      setTorchSupported(false)
    }
  }

  async function captureStill(): Promise<string | null> {
    const video = videoRef.current
    const stream = streamRef.current
    if (!video || !stream) return null

    // Prefer canvas so CSS digital zoom is baked into the still.
    // ImageCapture takePhoto ignores preview zoom.
    if (zoom === 1) {
      const tracks = stream.getVideoTracks()
      if (tracks.length > 0 && typeof window.ImageCapture === 'function') {
        try {
          const imageCapture = new window.ImageCapture(tracks[0])
          const blob = await imageCapture.takePhoto()
          return await blobToDataUrl(blob)
        } catch {
          // fall through to canvas capture
        }
      }
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    const scale = zoom
    const sw = canvas.width / scale
    const sh = canvas.height / scale
    const sx = (canvas.width - sw) / 2
    const sy = (canvas.height - sh) / 2
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.92)
  }

  async function handleSnap() {
    if (atCap || freezing) return
    const dataUrl = await captureStill()
    if (!dataUrl) {
      setError('Could not capture a photo. Please try again.')
      return
    }

    setFreezeFrame(dataUrl)
    setFreezing(true)

    const result = appendPhoto(
      session.guestId,
      dataUrl,
      new Date().toISOString(),
    )
    setPhotos(result.photos)
    onPhotoSaved(result.photos.length)

    if (!result.saved) {
      setError(
        result.capped
          ? `Each guest gets ${MAX_PHOTOS_PER_GUEST} photos for this celebration.`
          : 'Could not save this photo. Storage may be full — try again.',
      )
      setFreezing(false)
      setFreezeFrame(null)
      return
    }

    setFlyingPhoto(dataUrl)

    window.setTimeout(() => {
      setFreezing(false)
      setFreezeFrame(null)
    }, 700)
    window.setTimeout(() => setFlyingPhoto(null), 850)
  }

  function toggleFacing() {
    setZoom(1)
    setTorchOn(false)
    setFacing((prev) => (prev === 'user' ? 'environment' : 'user'))
  }

  function onTouchStart(event: TouchEvent) {
    if (event.touches.length === 2) {
      pinchStartDist.current = touchDistance(event.touches)
      pinchStartZoom.current = zoom
    }
  }

  function onTouchMove(event: TouchEvent) {
    if (event.touches.length !== 2 || pinchStartDist.current == null) return
    event.preventDefault()
    const dist = touchDistance(event.touches)
    const ratio = dist / pinchStartDist.current
    const next = clamp(pinchStartZoom.current * ratio, MIN_ZOOM, MAX_ZOOM)
    setZoom(next)
  }

  function onTouchEnd(event: TouchEvent) {
    if (event.touches.length < 2) {
      pinchStartDist.current = null
    }
  }

  const FlashIcon = torchOn ? Flashlight : FlashlightOff

  return (
    <section
      className="wd-camera wd-camera--instant"
      aria-labelledby="wd-camera-title"
    >
      <header className="wd-camera__header">
        <p className="wd-camera__count" aria-live="polite">
          {atCap
            ? `0/${MAX_PHOTOS_PER_GUEST} left`
            : `${remaining}/${MAX_PHOTOS_PER_GUEST} left`}
        </p>
        <h1 id="wd-camera-title" className="wd-camera__title">
          New moment
        </h1>
        <button
          type="button"
          className="wd-camera__moments"
          onClick={onViewPostCapture}
          aria-label={`Open your moments${photos.length ? `, ${photos.length} saved` : ''}`}
        >
          {latestPhoto ? (
            <img
              src={latestPhoto.dataUrl}
              alt=""
              className="wd-camera__moments-img"
            />
          ) : (
            <Images aria-hidden="true" />
          )}
          {photos.length > 0 ? (
            <span className="wd-camera__moments-count">{photos.length}</span>
          ) : null}
        </button>
      </header>

      {error ? (
        <div className="wd-state" role="alert">
          <p className="wd-state__copy">{error}</p>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              setError(null)
              void startCamera(facing)
            }}
          >
            Retry camera
          </Button>
        </div>
      ) : null}

      {atCap ? (
        <div className="wd-state" role="status">
          <p className="wd-state__title">You&apos;ve used all your snaps</p>
          <p className="wd-state__copy">
            Each guest gets {MAX_PHOTOS_PER_GUEST} photos for this celebration.
          </p>
          <Button type="button" size="lg" onClick={onViewPostCapture}>
            Continue
          </Button>
        </div>
      ) : (
        <>
          <div
            className="wd-camera__stage"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="wd-camera__viewfinder">
              {/*
                Digital pinch-to-zoom via CSS transform only.
                This is NOT optical/hardware zoom — unsupported on iOS Safari.
              */}
              <div
                className="wd-camera__zoom"
                style={{ transform: `scale(${zoom})` }}
              >
                <video
                  ref={videoRef}
                  className="wd-camera__video"
                  playsInline
                  muted
                  autoPlay
                  aria-label="Live camera preview"
                />
              </div>
              {freezeFrame ? (
                <img
                  src={freezeFrame}
                  alt=""
                  className={`wd-camera__freeze${freezing ? ' is-visible' : ''}`}
                />
              ) : null}
              {starting ? (
                <p className="wd-camera__loading">Starting camera…</p>
              ) : null}
            </div>
            <p className="wd-camera__film-caption">
              Jianne &amp; Joe <span>Wedding day</span>
            </p>
          </div>

          {flyingPhoto ? (
            <img
              key={flyingPhoto}
              src={flyingPhoto}
              alt=""
              className="wd-camera__flying-photo"
            />
          ) : null}

          <div className="wd-camera__controls">
            <div className="wd-camera__controls-side wd-camera__controls-side--start">
              <button
                type="button"
                className={`wd-camera__flash${torchOn ? ' is-on' : ''}`}
                onClick={() => void setTorch(!torchOn)}
                disabled={starting || !torchSupported}
                aria-label={
                  torchSupported
                    ? torchOn
                      ? 'Turn flash off'
                      : 'Turn flash on'
                    : 'Flash not available on this camera'
                }
                aria-pressed={torchSupported ? torchOn : undefined}
                title={
                  torchSupported
                    ? undefined
                    : 'Flash is not available on this device or camera'
                }
              >
                <FlashIcon aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              className="wd-camera__shutter"
              onClick={() => void handleSnap()}
              disabled={freezing || starting || Boolean(error)}
              aria-label="Take photo"
            />

            <div className="wd-camera__controls-side wd-camera__controls-side--end">
              <button
                type="button"
                className="wd-camera__flip"
                onClick={toggleFacing}
                disabled={starting}
                aria-label="Switch camera"
              >
                <SwitchCamera aria-hidden="true" />
              </button>
            </div>
          </div>
          <p className="wd-camera__hint">
            {torchSupported
              ? 'Flash · Pinch to zoom · Tap to capture'
              : 'Pinch to zoom · Tap to capture'}
          </p>
        </>
      )}
    </section>
  )
}

function touchDistance(touches: TouchList): number {
  const a = touches[0]
  const b = touches[1]
  const dx = a.clientX - b.clientX
  const dy = a.clientY - b.clientY
  return Math.hypot(dx, dy)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}
