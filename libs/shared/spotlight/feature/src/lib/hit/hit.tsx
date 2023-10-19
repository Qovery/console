import { Command } from '@qovery/shared/ui'
import Snippet from '../snippet/snippet'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Hit({ hit: item }: any) {
  return (
    <Command.Item onSelect={() => window.open(item.url, '_blank')}>
      <div className="DocSearch-Hit-Container">
        {item.hierarchy[item.type] && item.type === 'lvl1' && (
          <div className="DocSearch-Hit-content-wrapper">
            <Snippet className="DocSearch-Hit-title" hit={item} attribute="hierarchy.lvl1" />
            {item.content && <Snippet className="DocSearch-Hit-path" hit={item} attribute="content" />}
          </div>
        )}

        {item.hierarchy[item.type] &&
          (item.type === 'lvl2' ||
            item.type === 'lvl3' ||
            item.type === 'lvl4' ||
            item.type === 'lvl5' ||
            item.type === 'lvl6') && (
            <div className="DocSearch-Hit-content-wrapper">
              <Snippet className="DocSearch-Hit-title" hit={item} attribute={`hierarchy.${item.type}`} />
              <Snippet className="DocSearch-Hit-path" hit={item} attribute="hierarchy.lvl1" />
            </div>
          )}

        {item.type === 'content' && (
          <div className="DocSearch-Hit-content-wrapper">
            <Snippet className="DocSearch-Hit-title" hit={item} attribute="content" />
            <Snippet className="DocSearch-Hit-path" hit={item} attribute="hierarchy.lvl1" />
          </div>
        )}
      </div>
    </Command.Item>
  )
}

export default Hit
