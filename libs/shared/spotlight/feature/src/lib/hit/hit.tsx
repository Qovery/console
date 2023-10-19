import { type PropsWithChildren } from 'react'
import { Command } from '@qovery/shared/ui'
import Snippet from '../snippet/snippet'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Wrapper({ children }: PropsWithChildren) {
  return <div className="flex flex-col gap-0.5">{children}</div>
}

export function Hit({ hit: item }: any) {
  console.log(item)

  return (
    <Command.Item onSelect={() => window.open(item.url, '_blank')}>
      {item.hierarchy[item.type] && item.type === 'lvl1' && (
        <Wrapper>
          <Snippet className="font-medium text-sm" hit={item} attribute="hierarchy.lvl1" />
          {item.content && <Snippet className="text-xs text-neutral-350" hit={item} attribute="content" />}
        </Wrapper>
      )}

      {item.hierarchy[item.type] &&
        (item.type === 'lvl2' ||
          item.type === 'lvl3' ||
          item.type === 'lvl4' ||
          item.type === 'lvl5' ||
          item.type === 'lvl6') && (
          <Wrapper>
            <Snippet className="font-medium text-sm" hit={item} attribute={`hierarchy.${item.type}`} />
            <Snippet className="text-xs text-neutral-350" hit={item} attribute="hierarchy.lvl1" />
          </Wrapper>
        )}

      {item.type === 'content' && (
        <Wrapper>
          <Snippet className="font-medium text-sm" hit={item} attribute="content" />
          <Snippet className="text-xs text-neutral-350" hit={item} attribute="hierarchy.lvl1" />
        </Wrapper>
      )}
    </Command.Item>
  )
}

export default Hit
