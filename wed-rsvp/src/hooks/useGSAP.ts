import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type GSAPCallback = () => void

// Run before paint in the browser so initial gsap.set() states apply before the
// first frame (avoids a flash of the un-initialized layout). Fall back to
// useEffect for any non-DOM environment.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

export function useGSAP(callback: GSAPCallback, deps: React.DependencyList = []) {
  const callbackRef = useRef(callback)
  // Must update during render — layout effects run before passive useEffect,
  // so a post-paint ref update leaves the previous closure (e.g. animate=false).
  callbackRef.current = callback

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      callbackRef.current()
    })

    return () => {
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
