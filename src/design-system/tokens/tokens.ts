/** Token names available to component props. The values live in tokens.css. */

export const spaceScale = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16] as const
export type Space = (typeof spaceScale)[number]

export const tones = [
  'neutral',
  'accent',
  'success',
  'warning',
  'danger',
  'info',
  'highlight',
] as const
export type Tone = (typeof tones)[number]

export const sizes = ['sm', 'md', 'lg'] as const
export type Size = (typeof sizes)[number]

export function spaceVar(space: Space): string {
  return `var(--ds-space-${space})`
}
