export interface HighlightTextProps {
  text: string
  highlight?: string
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function HighlightText({ text, highlight }: HighlightTextProps) {
  const query = highlight?.trim()
  // Split with a capture group puts matches at odd indexes.
  const parts = query ? text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi')) : [text]

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark key={index} className="rounded-sm bg-surface-warning-strong text-neutral">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}

export default HighlightText
