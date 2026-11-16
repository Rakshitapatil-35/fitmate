import { useLayoutEffect } from 'react'

export default function useGsapReveal(scopeRef) {
  useLayoutEffect(() => {
    let media = null
    let cancelled = false

    import('gsap').then(({ gsap }) => {
      if (cancelled || !scopeRef.current) return
      media = gsap.matchMedia(scopeRef.current)
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.timeline({ defaults: { ease: 'power2.out' } })
          .from('[data-home-reveal="eyebrow"]', { autoAlpha: 0, y: 12, duration: 0.55 })
          .from('[data-home-reveal="title"]', { autoAlpha: 0, y: 24, duration: 0.8 }, '-=0.25')
          .from('[data-home-reveal="copy"]', { autoAlpha: 0, y: 16, duration: 0.6 }, '-=0.35')
          .from('[data-home-reveal="actions"]', { autoAlpha: 0, y: 12, duration: 0.5 }, '-=0.2')
      })
    })

    return () => {
      cancelled = true
      media?.revert()
    }
  }, [scopeRef])
}
