// SGR escape codes (colors, bold…), the ones log messages carry
// eslint-disable-next-line no-control-regex
const ANSI_SGR_REGEX = /\u001b\[[\d;]*m/g

export function stripAnsi(text: string) {
  return text.replace(ANSI_SGR_REGEX, '')
}

export interface AnsiTextPart {
  text: string
  isMatch: boolean
}

/**
 * Splits a message carrying ANSI codes around the matches of the query, ignoring case.
 * Matches are plain text. Other parts start with the codes set before them, so they keep their colors.
 */
export function splitAnsiTextOnMatches(message: string, query: string): AnsiTextPart[] {
  // Text between escape codes, with the codes set before it
  const chunks: { text: string; codes: string }[] = []
  let codes = ''
  let lastIndex = 0
  for (const match of message.matchAll(ANSI_SGR_REGEX)) {
    if (match.index > lastIndex) chunks.push({ text: message.slice(lastIndex, match.index), codes })
    codes += match[0]
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < message.length) chunks.push({ text: message.slice(lastIndex), codes })

  const plainText = chunks.map((chunk) => chunk.text).join('')
  const normalizedQuery = query.trim().toLowerCase()
  const matchRanges: [start: number, end: number][] = []
  if (normalizedQuery) {
    const normalizedText = plainText.toLowerCase()
    let matchIndex = normalizedText.indexOf(normalizedQuery)
    while (matchIndex >= 0) {
      matchRanges.push([matchIndex, matchIndex + normalizedQuery.length])
      matchIndex = normalizedText.indexOf(normalizedQuery, matchIndex + normalizedQuery.length)
    }
  }

  const parts: AnsiTextPart[] = []
  let chunkStart = 0
  for (const chunk of chunks) {
    const chunkEnd = chunkStart + chunk.text.length
    const boundaries = new Set([chunkStart, chunkEnd])
    for (const [start, end] of matchRanges) {
      if (start > chunkStart && start < chunkEnd) boundaries.add(start)
      if (end > chunkStart && end < chunkEnd) boundaries.add(end)
    }
    const sortedBoundaries = [...boundaries].sort((a, b) => a - b)

    for (let index = 0; index < sortedBoundaries.length - 1; index++) {
      const start = sortedBoundaries[index]
      const end = sortedBoundaries[index + 1]
      const text = plainText.slice(start, end)
      const isMatch = matchRanges.some(([matchStart, matchEnd]) => matchStart <= start && end <= matchEnd)
      const previousPart = parts[parts.length - 1]
      // A match across a color change stays one highlight
      if (isMatch && previousPart?.isMatch) {
        previousPart.text += text
      } else {
        parts.push({ text: isMatch ? text : chunk.codes + text, isMatch })
      }
    }
    chunkStart = chunkEnd
  }

  return parts
}
