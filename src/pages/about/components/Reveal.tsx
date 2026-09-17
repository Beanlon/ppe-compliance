import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'

type RevealProps = {
  children: ReactNode
  className?: string
  /** fade-up | fade-in | scale-in */
  variant?: 'fade-up' | 'fade-in' | 'scale-in'
  /** Extra delay after the element enters view (ms) */
  delayMs?: number
  /** How much of the element must be visible (0–1) */
  threshold?: number
}

export function Reveal({
  children,
  className = '',
  variant = 'fade-up',
  delayMs = 0,
  threshold = 0.18,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reduceMotion) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(node)
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  const style: CSSProperties | undefined =
    delayMs > 0 && visible ? { transitionDelay: `${delayMs}ms` } : undefined

  return (
    <div
      ref={ref}
      style={style}
      className={`about-reveal about-reveal-${variant}${visible ? ' is-visible' : ''} ${className}`.trim()}
    >
      {children}
    </div>
  )
}
