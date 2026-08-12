const DEFAULT_SKIP = new Set(['the', 'and', 'of', 'at', 'to', 'a', 'an'])

type WordInitialOptions = {
  /** Lowercase words whose first letter should stay Serif (not Script). */
  skip?: string[]
}

/**
 * Indices of the first letter of each word suitable for Script flourishes.
 * Skips small connector words by default (the, and, of, …).
 */
export function wordInitialScriptIndices(
  text: string,
  options: WordInitialOptions = {},
): number[] {
  const skip = new Set(
    (options.skip ?? [...DEFAULT_SKIP]).map((w) => w.toLowerCase()),
  )
  const indices: number[] = []
  const chars = Array.from(text)
  let wordStart = -1
  let word = ''

  const flushWord = () => {
    if (wordStart < 0 || !word) return
    if (!skip.has(word.toLowerCase())) {
      indices.push(wordStart)
    }
    wordStart = -1
    word = ''
  }

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i]!
    if (/\s/.test(char) || /[^\p{L}\p{N}']/u.test(char)) {
      flushWord()
      continue
    }
    if (wordStart < 0) wordStart = i
    word += char
  }
  flushWord()

  return indices
}

type MixedDisplayTextProps = {
  text: string
  /**
   * 0-based character indices (after case transform) rendered in Loren Blake Script.
   * Defaults to the first character when omitted.
   */
  scriptIndices?: number[]
  /** Uppercase for specimen-style display titles (default true). */
  uppercase?: boolean
  className?: string
  /** Optional extra classes for specific character indices (kerning tweaks, etc.). */
  charClassByIndex?: Record<number, string>
}

function charClassName(
  base: string,
  index: number,
  charClassByIndex?: Record<number, string>,
): string {
  const extra = charClassByIndex?.[index]
  return extra ? `${base} ${extra}` : base
}

/**
 * Loren Blake duo formatting: upright Serif with Script flourishes on selected
 * characters. Preserves spaces and punctuation.
 */
export default function MixedDisplayText({
  text,
  scriptIndices,
  uppercase = true,
  className,
  charClassByIndex,
}: MixedDisplayTextProps) {
  const display = uppercase ? text.toUpperCase() : text
  const chars = Array.from(display)
  const resolvedIndices =
    scriptIndices ?? (chars.length > 0 ? [0] : [])
  const scriptSet = new Set(resolvedIndices)

  return (
    <span className={className}>
      {chars.map((char, index) => {
        if (/\s/.test(char)) {
          return <span key={`${index}-space`}>{' '}</span>
        }

        const isLetter = /\p{L}/u.test(char)
        if (!isLetter) {
          return (
            <span
              key={`${index}-${char}`}
              className={charClassName('mixed-name__serif', index, charClassByIndex)}
            >
              {char}
            </span>
          )
        }

        return (
          <span
            key={`${index}-${char}`}
            className={charClassName(
              scriptSet.has(index) ? 'mixed-name__script' : 'mixed-name__serif',
              index,
              charClassByIndex,
            )}
          >
            {char}
          </span>
        )
      })}
    </span>
  )
}
