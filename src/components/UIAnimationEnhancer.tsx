import { useLayoutEffect } from 'react'
import type { RefObject } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'

type Props = {
  scope: RefObject<HTMLElement>
}

const HOVER_SELECTOR = [
  'main .glass-hover',
  'main .glass.rounded-xl',
  'main button',
  'main a',
  'aside button',
  'aside a',
].join(', ')

const PULSE_SELECTOR = [
  'main .glass svg',
  'aside .nav-active .rounded-full',
  'main [style*="var(--teal)"]',
].join(', ')

function uniqueElements(elements: HTMLElement[]): HTMLElement[] {
  return Array.from(new Set(elements))
}

export default function UIAnimationEnhancer({ scope }: Props) {
  const location = useLocation()

  useLayoutEffect(() => {
    if (!scope.current) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const detachListeners: Array<() => void> = []

    const ctx = gsap.context(() => {
      const bgTargets = gsap.utils.toArray<HTMLElement>('.bg-grid')
      bgTargets.forEach((target, idx) => {
        gsap.to(target, {
          backgroundPosition: `${12 + (idx % 3) * 4}px ${10 + (idx % 2) * 6}px`,
          duration: 20 + idx * 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      })

      const pulseTargets = gsap.utils
        .toArray<HTMLElement>(PULSE_SELECTOR)
        .filter((el) => el.offsetParent !== null)
        .slice(0, 28)

      if (pulseTargets.length > 0) {
        gsap.to(pulseTargets, {
          scale: 1.08,
          opacity: 0.86,
          duration: 2.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          stagger: {
            each: 0.12,
            from: 'random',
          },
          transformOrigin: 'center center',
        })
      }

      const entranceTargets = uniqueElements(
        gsap.utils
          .toArray<HTMLElement>('main h1, main h2, main p, main .glass, main .glass-hover')
          .filter((el) => el.offsetParent !== null)
          .slice(0, 26),
      )

      if (entranceTargets.length > 0) {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
        tl.from(entranceTargets, {
          opacity: 0,
          y: 20,
          duration: 0.65,
          stagger: 0.035,
          clearProps: 'opacity,transform',
        })
      }

      const interactiveTargets = uniqueElements(
        gsap.utils.toArray<HTMLElement>(HOVER_SELECTOR).filter((el) => el.offsetParent !== null),
      )

      const onEnter = (el: HTMLElement) => {
        gsap.to(el, {
          y: -6,
          scale: 1.012,
          boxShadow: '0 12px 28px rgba(0, 212, 170, 0.14)',
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }

      const onLeave = (el: HTMLElement) => {
        gsap.to(el, {
          y: 0,
          scale: 1,
          boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
          duration: 0.34,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }

      const onPress = (el: HTMLElement) => {
        gsap.to(el, {
          scale: 0.985,
          duration: 0.14,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }

      const onRelease = (el: HTMLElement) => {
        gsap.to(el, {
          scale: 1,
          duration: 0.2,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }

      interactiveTargets.forEach((target) => {
        const enterHandler = () => onEnter(target)
        const leaveHandler = () => onLeave(target)
        const downHandler = () => onPress(target)
        const upHandler = () => onRelease(target)

        target.addEventListener('mouseenter', enterHandler)
        target.addEventListener('mouseleave', leaveHandler)
        target.addEventListener('pointerdown', downHandler)
        target.addEventListener('pointerup', upHandler)
        target.addEventListener('pointercancel', upHandler)

        gsap.set(target, { willChange: 'transform' })

        ;(target as HTMLElement & {
          __gsapEnter?: () => void
          __gsapLeave?: () => void
          __gsapDown?: () => void
          __gsapUp?: () => void
        }).__gsapEnter = enterHandler
        ;(target as HTMLElement & {
          __gsapEnter?: () => void
          __gsapLeave?: () => void
          __gsapDown?: () => void
          __gsapUp?: () => void
        }).__gsapLeave = leaveHandler
        ;(target as HTMLElement & {
          __gsapEnter?: () => void
          __gsapLeave?: () => void
          __gsapDown?: () => void
          __gsapUp?: () => void
        }).__gsapDown = downHandler
        ;(target as HTMLElement & {
          __gsapEnter?: () => void
          __gsapLeave?: () => void
          __gsapDown?: () => void
          __gsapUp?: () => void
        }).__gsapUp = upHandler

        detachListeners.push(() => {
          target.removeEventListener('mouseenter', enterHandler)
          target.removeEventListener('mouseleave', leaveHandler)
          target.removeEventListener('pointerdown', downHandler)
          target.removeEventListener('pointerup', upHandler)
          target.removeEventListener('pointercancel', upHandler)
        })
      })
    }, scope)

    return () => {
      detachListeners.forEach((detach) => detach())
      ctx.revert()
    }
  }, [location.pathname, scope])

  return null
}