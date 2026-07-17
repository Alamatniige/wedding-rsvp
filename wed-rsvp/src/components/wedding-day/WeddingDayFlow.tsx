import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import CameraCapture from './CameraCapture'
import EmailLookup from './EmailLookup'
import Gallery from './Gallery'
import PostCapture from './PostCapture'
import { readPhotos, readRevealed, readSession } from './storage'
import type { WeddingDaySession } from './storage'

type FlowStep = 'lookup' | 'camera' | 'post' | 'gallery'

export default function WeddingDayFlow() {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<WeddingDaySession | null>(null)
  const [step, setStep] = useState<FlowStep>('lookup')
  const [photoCount, setPhotoCount] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [galleryGuestId, setGalleryGuestId] = useState<string | null>(null)

  useEffect(() => {
    const existing = readSession()
    const isRevealed = readRevealed()
    setRevealed(isRevealed)
    if (existing) {
      setSession(existing)
      const count = readPhotos(existing.guestId).length
      setPhotoCount(count)
      setStep(isRevealed && count > 0 ? 'gallery' : 'camera')
    }
    setReady(true)

    function onStorage(event: StorageEvent) {
      if (event.key === 'wedding:gallery-revealed') {
        setRevealed(event.newValue === 'true')
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    if (!ready) return
    const id = window.setInterval(() => {
      setRevealed(readRevealed())
    }, 1500)
    return () => window.clearInterval(id)
  }, [ready])

  function openGallery(guestId?: string | null) {
    setGalleryGuestId(guestId ?? null)
    setStep('gallery')
  }

  if (!ready) {
    return (
      <main className="wd-page">
        <div className="wd-page__sky" aria-hidden="true" />
        <div className="wd-page__content">
          <p className="wd-copy">Loading…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="wd-page">
      <div className="wd-page__sky" aria-hidden="true" />
      <div className="wd-page__content">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            {step === 'lookup' ? (
              <EmailLookup
                onMatched={(next) => {
                  setSession(next)
                  setPhotoCount(readPhotos(next.guestId).length)
                  setStep('camera')
                }}
              />
            ) : null}

            {step === 'camera' && session ? (
              <CameraCapture
                session={session}
                onPhotoSaved={(count) => {
                  setPhotoCount(count)
                }}
                onViewPostCapture={() => {
                  if (revealed) {
                    setGalleryGuestId(null)
                    setStep('gallery')
                  } else {
                    setStep('post')
                  }
                }}
              />
            ) : null}

            {step === 'post' && session ? (
              <PostCapture
                photoCount={photoCount}
                photos={readPhotos(session.guestId)}
                revealed={revealed}
                sessionGuestId={session.guestId}
                onBackToCamera={() => setStep('camera')}
                onViewGallery={openGallery}
              />
            ) : null}

            {step === 'gallery' ? (
              revealed ? (
                <Gallery
                  session={session}
                  initialGuestId={galleryGuestId}
                  onBack={() => {
                    setGalleryGuestId(null)
                    setStep('camera')
                  }}
                />
              ) : (
                <PostCapture
                  photoCount={photoCount}
                  photos={session ? readPhotos(session.guestId) : []}
                  revealed={false}
                  sessionGuestId={session?.guestId}
                  onBackToCamera={() => setStep('camera')}
                  onViewGallery={openGallery}
                />
              )
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}
