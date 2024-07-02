import { match } from 'ts-pattern'

export const trimId = (
  id: string,
  type: 'start' | 'end' | 'both' | undefined = 'both',
  { startOffset = 5, endOffset = 3 }: { startOffset?: number; endOffset?: number } | undefined = {}
) => {
  const start = id.slice(0, startOffset)
  const end = id.slice(-endOffset)

  return match(type)
    .with('start', () => start)
    .with('end', () => end)
    .with('both', () => `${start}...${end}`)
    .exhaustive()
}
