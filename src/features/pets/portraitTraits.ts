/**
 * Decides what a pet's generated portrait looks like. Every choice comes from
 * a seeded random sequence, so a pet always gets the same portrait.
 */

export const species = ['dog', 'cat', 'rabbit', 'lion', 'bird', 'critter'] as const
export type Species = (typeof species)[number]

export type Eyes = 'open' | 'happy' | 'wink'
export type Accessory = 'none' | 'partyHat' | 'crown' | 'bowTie' | 'glasses' | 'flower'
export type Backdrop = 'dots' | 'rays' | 'confetti' | 'hills'

export interface Fur {
  base: string
  light: string
  dark: string
}

export interface PortraitTraits {
  species: Species
  fur: Fur
  eyes: Eyes
  accessory: Accessory
  accent: string
  backdrop: Backdrop
  background: string
  backgroundDetail: string
  tongueOut: boolean
  /** Extra random numbers in [0, 1) for scattered details such as confetti. */
  scatter: number[]
}

const furs: ReadonlyArray<Fur> = [
  { base: '#d9a066', light: '#f3d9b5', dark: '#8f5a2a' },
  { base: '#9a6b4f', light: '#e2c4a8', dark: '#5e3d2b' },
  { base: '#f2e3c9', light: '#fffaf0', dark: '#c9a878' },
  { base: '#a7adb8', light: '#e4e7ec', dark: '#646b78' },
  { base: '#f0a04b', light: '#fde0b5', dark: '#b3601c' },
  { base: '#4a4652', light: '#b8b3c2', dark: '#2a2730' },
  { base: '#f7b7c8', light: '#fde6ec', dark: '#c7708a' },
  { base: '#b9a5ec', light: '#ebe3fb', dark: '#7559c0' },
  { base: '#9bd8c2', light: '#e0f5ec', dark: '#4f9c82' },
]

const birdFurs: ReadonlyArray<Fur> = [
  { base: '#6cb8f0', light: '#d6ecfb', dark: '#2f78b8' },
  { base: '#f7d154', light: '#fdf1bf', dark: '#c79a12' },
  { base: '#f2786b', light: '#fbd3cd', dark: '#b8392d' },
  { base: '#7fcf8a', light: '#dcf3df', dark: '#3d9149' },
]

const lionFurs: ReadonlyArray<Fur> = [
  { base: '#f1b85a', light: '#fde7bd', dark: '#b3661f' },
  { base: '#e9a04a', light: '#fbdcae', dark: '#8f4a1a' },
]

const backgrounds: ReadonlyArray<readonly [string, string]> = [
  ['#cdeee6', '#a9dccf'],
  ['#fde2c8', '#f9c99c'],
  ['#dfe4fb', '#bfc8f3'],
  ['#fbd9e4', '#f4b6c9'],
  ['#fff0b8', '#fbdc74'],
  ['#d9f0c4', '#b9df98'],
  ['#e6dcf8', '#cdbcf0'],
  ['#cfe8fa', '#a6d2f2'],
]

const accents = ['#e4572e', '#3b73d9', '#7a5bd6', '#14766b', '#d6336c', '#f2a900'] as const

const categoryHints: ReadonlyArray<readonly [RegExp, Species]> = [
  [/dog|pup|hound|canine/, 'dog'],
  [/cat|kitten|feline/, 'cat'],
  [/rabbit|bunn|hare/, 'rabbit'],
  [/lion|tiger|big cat/, 'lion'],
  [/bird|parrot|budgie|canar|finch/, 'bird'],
  [/hamster|bear|mouse|guinea|ferret/, 'critter'],
]

export function speciesForCategory(category: string | undefined): Species | undefined {
  const name = category?.toLowerCase() ?? ''

  return categoryHints.find(([pattern]) => pattern.test(name))?.[1]
}

/** A small, fast seeded generator (mulberry32). Returns numbers in [0, 1). */
function createRandom(seed: number): () => number {
  let state = seed >>> 0

  return () => {
    state = (state + 0x6d2b79f5) >>> 0

    let mixed = Math.imul(state ^ (state >>> 15), state | 1)

    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)

    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

function hash(value: string): number {
  let result = 2166136261

  for (const character of value) {
    result = Math.imul(result ^ character.charCodeAt(0), 16777619)
  }

  return result >>> 0
}

function pick<T>(items: ReadonlyArray<T>, random: () => number): T {
  return items[Math.floor(random() * items.length)] as T
}

export function portraitTraits(seed: number | string, category?: string): PortraitTraits {
  const random = createRandom(hash(String(seed)))

  const chosenSpecies = speciesForCategory(category) ?? pick(species, random)

  const fur =
    chosenSpecies === 'bird'
      ? pick(birdFurs, random)
      : chosenSpecies === 'lion'
        ? pick(lionFurs, random)
        : pick(furs, random)

  // Tall ears leave no room for a hat.
  const accessories: ReadonlyArray<Accessory> =
    chosenSpecies === 'rabbit'
      ? ['none', 'bowTie', 'glasses', 'flower', 'bowTie']
      : ['none', 'partyHat', 'crown', 'bowTie', 'glasses', 'flower', 'partyHat']

  const [background, backgroundDetail] = pick(backgrounds, random)

  return {
    species: chosenSpecies,
    fur,
    eyes: pick<Eyes>(['open', 'open', 'happy', 'wink'], random),
    accessory: pick(accessories, random),
    accent: pick(accents, random),
    backdrop: pick<Backdrop>(['dots', 'rays', 'confetti', 'hills'], random),
    background,
    backgroundDetail,
    tongueOut: random() < 0.5,
    scatter: Array.from({ length: 48 }, random),
  }
}
