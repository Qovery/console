import { type PropsWithChildren } from 'react'
import { ExternalLink } from '@qovery/shared/ui'
import Snippet from '../snippet/snippet'

function Wrapper({ children }: PropsWithChildren) {
  return <span className="flex flex-col gap-0.5">{children}</span>
}

// Inspired by https://github.com/algolia/docsearch/blob/6462d11826eea334e2fad1738d396571ea158035/packages/docsearch-react/src/Results.tsx#L116
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Hit({ hit: item }: any) {
  return (
    <ExternalLink href={item.url} withIcon={false}>
      {item.hierarchy[item.type] && item.type === 'lvl1' && (
        <Wrapper>
          <Snippet className="text-sm font-medium [&>mark]:text-sky-500" hit={item} attribute="hierarchy.lvl1" />
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
              className="text-sm font-medium [&>mark]:text-sky-500"
              hit={item}
              attribute={`hierarchy.${item.type}`}
            />
            <Snippet className="text-xs text-sky-400" hit={item} attribute="hierarchy.lvl1" />
          </Wrapper>
        )}

      {item.type === 'content' && (
        <Wrapper>
          <Snippet className="text-sm font-medium [&>mark]:text-sky-500" hit={item} attribute="content" />
          <Snippet className="text-xs text-sky-400 [&>mark]:text-sky-400" hit={item} attribute="hierarchy.lvl1" />
        </Wrapper>
      )}
    </ExternalLink>
  )
}

export default Hit
