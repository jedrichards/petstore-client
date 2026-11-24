import { useState } from 'react'
import type { CSSProperties } from 'react'

import { cx } from '@/lib/cx'

import styles from './Avatar.module.css'

const hues = [172, 205, 262, 330, 20, 45, 95, 140]

function hueFor(seed: string): number {
  let hash = 0

  for (const character of seed) hash = (hash * 31 + character.charCodeAt(0)) >>> 0

  return hues[hash % hues.length] ?? 172
}

function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const first = words[0]?.[0] ?? '?'
  const second = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : ''

  return (first + second).toUpperCase()
}

export interface AvatarProps {
  name: string
  /** An image to show. The initials tile is the fallback if it fails. */
  src?: string
  size?: 'sm' | 'md' | 'lg' | 'fill'
  shape?: 'circle' | 'square'
  className?: string
}

/** An image with a coloured initials tile as its fallback. */
export function Avatar({ name, src, size = 'md', shape = 'circle', className }: AvatarProps) {
  // Remember which address failed, so a new src gets its own attempt.
  const [failedSrc, setFailedSrc] = useState<string | undefined>(undefined)
  const tryImage = src !== undefined && src !== failedSrc

  const style = { '--avatar-hue': hueFor(name) } as CSSProperties

  return (
    <span className={cx(styles.avatar, styles[size], styles[shape], className)} style={style}>
      {/* The image paints over the initials, so a slow or broken one never leaves a blank tile. */}
      <span aria-hidden>{initialsFor(name)}</span>
      {tryImage ? (
        <img
          className={styles.image}
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(src)}
        />
      ) : null}
    </span>
  )
}
