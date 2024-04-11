import { createElement } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPropertyByPath(object: Record<string, any>, path: string): any {
  const parts = path.split('.')

  return parts.reduce((prev, current) => {
    if (prev?.[current]) return prev[current]
    return null
  }, object)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Snippet({ hit, attribute, tagName = 'span', ...rest }: any) {
  return createElement(tagName, {
    ...rest,
    dangerouslySetInnerHTML: {
      __html: getPropertyByPath(hit, `_snippetResult.${attribute}.value`) || getPropertyByPath(hit, attribute),
    },
  })
}

export default Snippet
