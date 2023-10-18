import '@docsearch/css'
import { createElement, useState } from 'react'
import { Hits, SearchBox, useInstantSearch } from 'react-instantsearch'
import { useNavigate, useParams } from 'react-router-dom'
import { APPLICATION_URL, DATABASE_URL, ENVIRONMENTS_URL, SERVICES_URL } from '@qovery/shared/routes'
import { Command, type CommandDialogProps, LoaderSpinner } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import useSuggestions from '../hooks/use-suggestions/use-suggestions'

export interface SpotlightProps extends Pick<CommandDialogProps, 'open' | 'onOpenChange'> {}

function getPropertyByPath(object: Record<string, any>, path: string): any {
  const parts = path.split('.')

  return parts.reduce((prev, current) => {
    if (prev?.[current]) return prev[current]
    return null
  }, object)
}

// interface SnippetProps<TItem> {
//   hit: TItem
//   attribute: string
//   tagName?: string
//   [prop: string]: unknown
// }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Snippet({ hit, attribute, tagName = 'span', ...rest }: any) {
  return createElement(tagName, {
    ...rest,
    dangerouslySetInnerHTML: {
      __html: getPropertyByPath(hit, `_snippetResult.${attribute}.value`) || getPropertyByPath(hit, attribute),
    },
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HitComponent({ hit: item }: any) {
  // console.log(item.type)

  return (
    <a href={item.url}>
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
    </a>
  )
}

export function Spotlight({ open, onOpenChange }: SpotlightProps) {
  const [value, setValue] = useState('')
  const { organizationId } = useParams()
  const navigate = useNavigate()

  const { data = [], isFetched } = useSuggestions({
    organizationId,
    search: value,
    enabled: Boolean(open) && Boolean(value),
  })

  const closeSpotlight = (url: string) => {
    navigate(url)
    onOpenChange?.(false)
  }

  const { setIndexUiState } = useInstantSearch()

  return (
    <Command.Dialog label="Console Spotlight" open={open} onOpenChange={onOpenChange}>
      <SearchBox className="hidden" />
      <Command.Input
        value={value}
        onValueChange={(value) => {
          setIndexUiState((prevIndexUiState) => {
            return {
              ...prevIndexUiState,
              query: value,
            }
          })

          setValue(value)
        }}
        placeholder="What do you need?"
      />
      <div>
        <Hits hitComponent={HitComponent} />
      </div>
      {value.length > 0 && (
        <Command.List>
          {!isFetched && <LoaderSpinner className="w-4 mx-auto pb-2" />}
          {isFetched && (
            <>
              <Command.Empty>No results found</Command.Empty>
              <Command.Group heading="Projects">
                {data
                  .filter(({ suggestionType }) => suggestionType === 'PROJECT')
                  .map(({ id, name }) => (
                    <Command.Item key={id} onSelect={() => closeSpotlight(ENVIRONMENTS_URL(organizationId, id))}>
                      {name}
                    </Command.Item>
                  ))}
              </Command.Group>
              <Command.Group heading="Environments">
                {data
                  .filter(({ suggestionType }) => suggestionType === 'ENVIRONMENT')
                  .map(({ id, name, projectId }) => (
                    <Command.Item key={id} onSelect={() => closeSpotlight(SERVICES_URL(organizationId, projectId, id))}>
                      {name}
                    </Command.Item>
                  ))}
              </Command.Group>
              <Command.Group heading="Services">
                {data
                  .filter((service) => service.serviceType)
                  .map(({ id, name, environmentId, projectId, serviceType, projectName, environmentName }) => (
                    <Command.Item
                      key={id}
                      onSelect={() =>
                        closeSpotlight(
                          serviceType === 'DATABASE'
                            ? DATABASE_URL(organizationId, projectId, environmentId, id)
                            : APPLICATION_URL(organizationId, projectId, environmentId, id)
                        )
                      }
                    >
                      {[projectName, environmentName, `${serviceType}:${name}`].map(upperCaseFirstLetter).join(' > ')}
                    </Command.Item>
                  ))}
              </Command.Group>
            </>
          )}
        </Command.List>
      )}
    </Command.Dialog>
  )
}

export default Spotlight
