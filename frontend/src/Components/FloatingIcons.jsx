import { useMemo } from 'react'

const ICONS = [
  'bi-book', 'bi-pencil', 'bi-folder', 'bi-code-slash',
  'bi-palette', 'bi-house', 'bi-globe2',
]

const GLOWS = [
  { left: 10, top: 20, size: 300, dur: 7 },
  { left: 35, top: 50, size: 250, dur: 10 },
  { left: 5, top: 70, size: 200, dur: 5.5 },
  { left: 50, top: 30, size: 180, dur: 13 },
  { left: 20, top: 85, size: 220, dur: 8.5 },
]

export default function FloatingIcons() {
  const items = useMemo(() =>
    ICONS.map((icon) => ({
      icon,
      left: Math.random() * 68 - 5,
      dur: 18.2 + Math.random() * 13,
      delay: Math.random() * 12,
      size: 1.2 + Math.random() * 0.8,
      alpha: 0.048 + Math.random() * 0.052,
    })),
  [])

  return (
    <div className="floating-icons">
      {GLOWS.map((g, i) => (
        <div
          key={`glow-${i}`}
          className="glow-circle"
          style={{
            left: `${g.left}%`,
            top: `${g.top}%`,
            width: g.size,
            height: g.size,
            animationDuration: `${g.dur}s`,
          }}
        />
      ))}
      {items.map((item, i) => (
        <i
          key={i}
          className={`bi ${item.icon}`}
          style={{
            left: `${item.left}%`,
            animationDuration: `${item.dur}s`,
            animationDelay: `${item.delay}s`,
            fontSize: `${item.size}rem`,
            opacity: item.alpha,
          }}
        />
      ))}
    </div>
  )
}
