export interface FormattedLogMessage {
  message: string
  sourceMap?: number[]
}

export interface HighlightRange {
  start: number
  end: number
}

function nextNonWhitespaceCharacter(message: string, start: number) {
  for (let index = start; index < message.length; index++) {
    if (!/\s/.test(message[index] ?? '')) return message[index]
  }

  return undefined
}

function previousNonWhitespaceCharacter(message: string, start: number) {
  for (let index = start; index >= 0; index--) {
    if (!/\s/.test(message[index] ?? '')) return message[index]
  }

  return undefined
}

export function formatObjectLogMessage(message: string): FormattedLogMessage {
  try {
    const parsedMessage: unknown = JSON.parse(message)

    if (typeof parsedMessage !== 'object' || parsedMessage === null || Array.isArray(parsedMessage)) {
      return { message }
    }
  } catch {
    return { message }
  }

  let formattedMessage = ''
  let indentation = 0
  let isInsideString = false
  let isEscaped = false
  const sourceMap = Array.from<number>({ length: message.length }).fill(-1)

  const appendSourceCharacter = (character: string, sourceIndex: number) => {
    sourceMap[sourceIndex] = formattedMessage.length
    formattedMessage += character
  }

  const appendNewLine = () => {
    formattedMessage += `\n${'  '.repeat(indentation)}`
  }

  for (let index = 0; index < message.length; index++) {
    const character = message[index] ?? ''

    if (isInsideString) {
      appendSourceCharacter(character, index)

      if (isEscaped) {
        isEscaped = false
      } else if (character === '\\') {
        isEscaped = true
      } else if (character === '"') {
        isInsideString = false
      }

      continue
    }

    if (/\s/.test(character)) continue

    if (character === '"') {
      isInsideString = true
      appendSourceCharacter(character, index)
      continue
    }

    if (character === '{' || character === '[') {
      appendSourceCharacter(character, index)

      const closingCharacter = character === '{' ? '}' : ']'
      if (nextNonWhitespaceCharacter(message, index + 1) !== closingCharacter) {
        indentation++
        appendNewLine()
      }
      continue
    }

    if (character === '}' || character === ']') {
      const openingCharacter = character === '}' ? '{' : '['
      if (previousNonWhitespaceCharacter(message, index - 1) !== openingCharacter) {
        indentation--
        appendNewLine()
      }
      appendSourceCharacter(character, index)
      continue
    }

    appendSourceCharacter(character, index)

    if (character === ',') {
      appendNewLine()
    } else if (character === ':') {
      formattedMessage += ' '
    }
  }

  return { message: formattedMessage, sourceMap }
}

export function findHighlightRanges(
  rawMessage: string,
  { message, sourceMap }: FormattedLogMessage,
  searchTerm: string | null | undefined
): HighlightRange[] {
  if (!searchTerm) return []

  const ranges: HighlightRange[] = []
  const normalizedSearchTerm = searchTerm.toLowerCase()
  const searchableMessage = sourceMap ? rawMessage : message
  const normalizedMessage = searchableMessage.toLowerCase()
  let matchIndex = normalizedMessage.indexOf(normalizedSearchTerm)

  while (matchIndex >= 0) {
    if (!sourceMap) {
      ranges.push({ start: matchIndex, end: matchIndex + searchTerm.length })
    } else {
      const matchEnd = matchIndex + searchTerm.length
      const mappedOffsets = sourceMap.slice(matchIndex, matchEnd).filter((offset) => offset >= 0)

      if (mappedOffsets.length > 0) {
        ranges.push({ start: mappedOffsets[0] ?? 0, end: (mappedOffsets[mappedOffsets.length - 1] ?? 0) + 1 })
      }
    }

    matchIndex = normalizedMessage.indexOf(normalizedSearchTerm, matchIndex + searchTerm.length)
  }

  return ranges
}
