import { type PropsWithChildren } from 'react'
import Snippet from '../snippet/snippet'

function Wrapper({ children }: PropsWithChildren) {
  return <span className="flex flex-col gap-0.5">{children}</span>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Hit({ hit: item }: any) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sky-500">
      {item.hierarchy[item.type] && item.type === 'lvl1' && (
        <Wrapper>
          <Snippet className="font-medium text-sm [&>mark]:text-sky-500" hit={item} attribute="hierarchy.lvl1" />
          {item.content && (
            <Snippet className="text-xs text-sky-400 [&>mark]:text-sky-400" hit={item} attribute="content" />
          )}
        </Wrapper>
      )}

      {item.hierarchy[item.type] &&
        (item.type === 'lvl2' ||
          item.type === 'lvl3' ||
          item.type === 'lvl4' ||
          item.type === 'lvl5' ||
          item.type === 'lvl6') && (
          <Wrapper>
            <Snippet
              className="font-medium text-sm [&>mark]:text-sky-500"
              hit={item}
              attribute={`hierarchy.${item.type}`}
            />
            <Snippet className="text-xs text-sky-400" hit={item} attribute="hierarchy.lvl1" />
          </Wrapper>
        )}

      {item.type === 'content' && (
        <Wrapper>
          <Snippet className="font-medium text-sm [&>mark]:text-sky-500" hit={item} attribute="content" />
          <Snippet className="text-xs text-sky-400 [&>mark]:text-sky-400" hit={item} attribute="hierarchy.lvl1" />
        </Wrapper>
      )}
    </a>
  )
}

export default Hit
