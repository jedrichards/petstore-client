import { useMemo } from 'react'
import type { ReactNode } from 'react'

import { portraitTraits } from './portraitTraits'
import type { PortraitTraits } from './portraitTraits'

const INK = '#2a2622'
const BLUSH = '#f58aa0'
const PINK = '#f7a8b8'
const CONFETTI = ['#e4572e', '#3b73d9', '#f2a900', '#7a5bd6', '#2c9a55', '#d6336c']

export interface PetPortraitProps {
  /** Anything stable about the pet, usually its id. The same seed draws the same portrait. */
  seed: number | string
  /** Picks the species when it names one, such as "Dogs". */
  category?: string
  className?: string
}

/**
 * A generated cartoon portrait of a pet, used when it has no usable photo.
 * Drawn on a 200 by 150 canvas and cropped to fill whatever box it is given.
 */
export function PetPortrait({ seed, category, className }: PetPortraitProps) {
  const traits = useMemo(() => portraitTraits(seed, category), [seed, category])

  return (
    <svg
      className={className}
      viewBox="0 0 200 150"
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      aria-hidden
    >
      <rect width="200" height="150" fill={traits.background} />
      <BackdropArt traits={traits} />

      {/* Shoulders */}
      <ellipse cx="100" cy="152" rx="46" ry="30" fill={traits.fur.base} />

      <Ears traits={traits} />
      <circle cx="100" cy="82" r="38" fill={traits.fur.base} />
      <Muzzle traits={traits} />

      <circle cx="72" cy="94" r="6" fill={BLUSH} opacity="0.45" />
      <circle cx="128" cy="94" r="6" fill={BLUSH} opacity="0.45" />

      <EyesArt traits={traits} />
      <AccessoryArt traits={traits} />
    </svg>
  )
}

interface ArtProps {
  traits: PortraitTraits
}

function BackdropArt({ traits }: ArtProps) {
  const fill = traits.backgroundDetail
  const at = (index: number) => traits.scatter[index] ?? 0.5

  switch (traits.backdrop) {
    case 'dots': {
      const dots: ReactNode[] = []

      for (let row = 0; row < 6; row++) {
        for (let column = 0; column < 8; column++) {
          dots.push(
            <circle
              key={`${row}-${column}`}
              cx={column * 28 + (row % 2 === 0 ? 8 : 22)}
              cy={row * 28 + 8}
              r="4"
              fill={fill}
            />,
          )
        }
      }

      return <g>{dots}</g>
    }

    case 'rays':
      return (
        <g fill={fill}>
          {Array.from({ length: 8 }, (_, index) => {
            const start = (index * 45 * Math.PI) / 180
            const end = ((index * 45 + 22.5) * Math.PI) / 180
            const reach = 220

            const points = [
              '100,84',
              `${100 + Math.cos(start) * reach},${84 + Math.sin(start) * reach}`,
              `${100 + Math.cos(end) * reach},${84 + Math.sin(end) * reach}`,
            ].join(' ')

            return <polygon key={index} points={points} />
          })}
        </g>
      )

    case 'confetti':
      return (
        <g>
          {Array.from({ length: 16 }, (_, index) => (
            <rect
              key={index}
              x={at(index * 3) * 190}
              y={at(index * 3 + 1) * 140}
              width="8"
              height="4"
              rx="1"
              fill={CONFETTI[index % CONFETTI.length]}
              opacity="0.8"
              transform={`rotate(${at(index * 3 + 2) * 180} ${at(index * 3) * 190 + 4} ${at(index * 3 + 1) * 140 + 2})`}
            />
          ))}
        </g>
      )

    case 'hills':
      return (
        <g>
          {/* Kept clear of the corners, where cards overlay a badge and a button. */}
          <circle cx="160" cy="64" r="14" fill="#fff6d6" opacity="0.9" />
          <ellipse cx="40" cy="150" rx="90" ry="46" fill={fill} />
          <ellipse cx="170" cy="156" rx="90" ry="40" fill={fill} opacity="0.7" />
        </g>
      )
  }
}

function Ears({ traits }: ArtProps) {
  const { base, light, dark } = traits.fur

  switch (traits.species) {
    case 'dog':
      return (
        <g fill={dark}>
          <ellipse cx="62" cy="74" rx="13" ry="27" transform="rotate(16 62 74)" />
          <ellipse cx="138" cy="74" rx="13" ry="27" transform="rotate(-16 138 74)" />
        </g>
      )

    case 'cat':
      return (
        <g>
          <polygon points="64,66 62,26 94,50" fill={base} />
          <polygon points="136,66 138,26 106,50" fill={base} />
          <polygon points="69,56 68,36 84,50" fill={PINK} />
          <polygon points="131,56 132,36 116,50" fill={PINK} />
        </g>
      )

    case 'rabbit':
      return (
        <g>
          <ellipse cx="82" cy="34" rx="11" ry="31" fill={base} transform="rotate(-8 82 34)" />
          <ellipse cx="118" cy="34" rx="11" ry="31" fill={base} transform="rotate(8 118 34)" />
          <ellipse cx="82" cy="36" rx="5" ry="22" fill={PINK} transform="rotate(-8 82 36)" />
          <ellipse cx="118" cy="36" rx="5" ry="22" fill={PINK} transform="rotate(8 118 36)" />
        </g>
      )

    case 'lion':
      return (
        <g>
          {Array.from({ length: 14 }, (_, index) => {
            const angle = (index / 14) * Math.PI * 2

            return (
              <circle
                key={index}
                cx={100 + Math.cos(angle) * 40}
                cy={82 + Math.sin(angle) * 40}
                r="14"
                fill={dark}
              />
            )
          })}
          <circle cx="70" cy="52" r="10" fill={base} />
          <circle cx="130" cy="52" r="10" fill={base} />
          <circle cx="70" cy="52" r="5" fill={light} />
          <circle cx="130" cy="52" r="5" fill={light} />
        </g>
      )

    case 'bird':
      return (
        <g fill={dark}>
          <ellipse cx="100" cy="42" rx="5" ry="12" />
          <ellipse cx="90" cy="46" rx="4" ry="10" transform="rotate(-24 90 46)" />
          <ellipse cx="110" cy="46" rx="4" ry="10" transform="rotate(24 110 46)" />
        </g>
      )

    case 'critter':
      return (
        <g>
          <circle cx="68" cy="52" r="14" fill={base} />
          <circle cx="132" cy="52" r="14" fill={base} />
          <circle cx="68" cy="52" r="7" fill={light} />
          <circle cx="132" cy="52" r="7" fill={light} />
        </g>
      )
  }
}

const smile = 'M100 97 q-6 7 -12 1 M100 97 q6 7 12 1'

function Muzzle({ traits }: ArtProps) {
  const { light } = traits.fur
  const line = { fill: 'none', stroke: INK, strokeWidth: 2, strokeLinecap: 'round' } as const

  switch (traits.species) {
    case 'dog':
      return (
        <g>
          <ellipse cx="100" cy="98" rx="21" ry="16" fill={light} />
          {traits.tongueOut ? <ellipse cx="100" cy="107" rx="5" ry="7" fill={PINK} /> : null}
          <path d={`M100 93 v4 ${smile}`} {...line} />
          <ellipse cx="100" cy="90" rx="7" ry="5" fill={INK} />
        </g>
      )

    case 'cat':
      return (
        <g>
          <ellipse cx="100" cy="99" rx="15" ry="10" fill={light} />
          <path d={smile} {...line} />
          <polygon points="95,91 105,91 100,97" fill={PINK} />
          <path
            d="M76 96 h-16 M77 101 l-15 4 M124 96 h16 M123 101 l15 4"
            {...line}
            strokeWidth={1.2}
          />
        </g>
      )

    case 'rabbit':
      return (
        <g>
          <ellipse cx="100" cy="99" rx="15" ry="11" fill={light} />
          <rect x="96" y="100" width="8" height="8" rx="1.5" fill="#ffffff" stroke={INK} />
          <path d={smile} {...line} />
          <ellipse cx="100" cy="92" rx="4.5" ry="3.5" fill={PINK} />
        </g>
      )

    case 'lion':
      return (
        <g>
          <ellipse cx="100" cy="99" rx="18" ry="13" fill={light} />
          <path d={smile} {...line} />
          <polygon points="93,90 107,90 100,98" fill={INK} />
        </g>
      )

    case 'bird':
      return (
        <g>
          <ellipse cx="100" cy="104" rx="20" ry="14" fill={light} />
          <polygon points="90,88 110,88 100,103" fill="#f29a2e" />
          <polygon points="93,88 107,88 100,93" fill="#d97b12" />
        </g>
      )

    case 'critter':
      return (
        <g>
          <ellipse cx="100" cy="99" rx="17" ry="12" fill={light} />
          <path d={`M100 94 v3 ${smile}`} {...line} />
          <ellipse cx="100" cy="92" rx="5" ry="3.5" fill={INK} />
        </g>
      )
  }
}

function EyesArt({ traits }: ArtProps) {
  const open = (cx: number) => (
    <g>
      <circle cx={cx} cy="78" r="5" fill={INK} />
      <circle cx={cx + 1.6} cy="76.4" r="1.6" fill="#ffffff" />
    </g>
  )

  const closed = (cx: number) => (
    <path
      d={`M${cx - 5} 80 q5 -7 10 0`}
      fill="none"
      stroke={INK}
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  )

  switch (traits.eyes) {
    case 'open':
      return (
        <g>
          {open(84)}
          {open(116)}
        </g>
      )

    case 'happy':
      return (
        <g>
          {closed(84)}
          {closed(116)}
        </g>
      )

    case 'wink':
      return (
        <g>
          {open(84)}
          {closed(116)}
        </g>
      )
  }
}

function AccessoryArt({ traits }: ArtProps) {
  const accent = traits.accent

  switch (traits.accessory) {
    case 'none':
      return null

    case 'partyHat':
      return (
        <g>
          <polygon points="100,14 82,52 118,52" fill={accent} />
          <polygon points="93,30 107,30 110,37 90,37" fill="#ffffff" opacity="0.7" />
          <polygon points="86,44 114,44 118,52 82,52" fill="#ffffff" opacity="0.7" />
          <circle cx="100" cy="14" r="6" fill="#fff6d6" />
        </g>
      )

    case 'crown':
      return (
        <g>
          <polygon points="78,52 76,28 90,40 100,24 110,40 124,28 122,52" fill="#f6c343" />
          <rect x="78" y="46" width="44" height="6" fill="#e0a318" />
          <circle cx="100" cy="40" r="3" fill={accent} />
        </g>
      )

    case 'bowTie':
      return (
        <g fill={accent}>
          <polygon points="100,126 82,115 82,137" />
          <polygon points="100,126 118,115 118,137" />
          <circle cx="100" cy="126" r="5" fill="#ffffff" opacity="0.85" />
        </g>
      )

    case 'glasses':
      return (
        <g fill="#ffffff" fillOpacity="0.25" stroke={INK} strokeWidth="2.4">
          <circle cx="84" cy="78" r="11" />
          <circle cx="116" cy="78" r="11" />
          <path d="M95 78 h10 M73 76 l-9 -4 M127 76 l9 -4" fill="none" />
        </g>
      )

    case 'flower':
      return (
        <g>
          {Array.from({ length: 5 }, (_, index) => {
            const angle = (index / 5) * Math.PI * 2

            return (
              <circle
                key={index}
                cx={130 + Math.cos(angle) * 7}
                cy={54 + Math.sin(angle) * 7}
                r="6"
                fill={accent}
              />
            )
          })}
          <circle cx="130" cy="54" r="5" fill="#ffe27a" />
        </g>
      )
  }
}
