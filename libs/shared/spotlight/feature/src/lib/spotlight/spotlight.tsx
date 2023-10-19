import { type ChangeEvent, type KeyboardEvent, useCallback, useDeferredValue, useState } from 'react'
import { Hits, SearchBox, useInstantSearch } from 'react-instantsearch'
import { useNavigate, useParams } from 'react-router-dom'
import { IconEnum } from '@qovery/shared/enums'
import { APPLICATION_URL, DATABASE_URL, ENVIRONMENTS_URL, SERVICES_URL } from '@qovery/shared/routes'
import {
  Badge,
  Command,
  type CommandDialogProps,
  Icon,
  IconAwesomeEnum,
  LoaderSpinner,
  commandInputStyle,
} from '@qovery/shared/ui'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'
import Hit from '../hit/hit'
import useSuggestions from '../hooks/use-suggestions/use-suggestions'

export interface SpotlightProps extends Pick<CommandDialogProps, 'open' | 'onOpenChange'> {}

export function Spotlight({ open, onOpenChange }: SpotlightProps) {
  const [value, setValue] = useState('')
  const { organizationId } = useParams()
  const navigate = useNavigate()
  const [pages, setPages] = useState<string[]>(['home'])
  const activePage = pages[pages.length - 1]

  const { data = [], isFetched } = useSuggestions({
    organizationId,
    search: value,
    enabled: Boolean(open) && Boolean(value),
  })

  const { setIndexUiState, indexUiState } = useInstantSearch()
  const valueDoc = useDeferredValue(indexUiState.query ?? '')

  const closeSpotlight = (url: string) => {
    navigate(url)
    onOpenChange?.(false)
    setValue('')
    setIndexUiState((prevIndexUiState) => {
      return {
        ...prevIndexUiState,
        query: '',
      }
    })
  }

  const popPage = useCallback(() => {
    setPages((pages) => {
      const x = [...pages]
      x.splice(-1, 1)
      return x
    })
  }, [])

  console.log('value: ', value)

  return (
    <Command.Dialog
      label="Console Spotlight"
      open={open}
      onOpenChange={onOpenChange}
      onKeyDown={(event: KeyboardEvent) => {
        if (pages.length > 1 && valueDoc.length === 0 && event.key === 'Backspace') {
          event.preventDefault()
          popPage()
        }
      }}
    >
      <div className="flex gap-1 px-2">
        {pages.map((page) => (
          <span
            key={page}
            className="h-5 inline-flex items-center px-2 text-xs capitalize bg-neutral-150 text-neutral-400 rounded font-medium"
          >
            {page}
          </span>
        ))}
      </div>
      <SearchBox className="hidden" />
      {activePage === 'home' && (
        <Command.Input
          autoFocus
          value={value}
          onValueChange={(value) => setValue(value)}
          placeholder="What do you need?"
        />
      )}
      {activePage === 'documentation' && (
        <input
          autoFocus
          className={twMerge(commandInputStyle, 'mb-2')}
          value={valueDoc}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            setIndexUiState((prevIndexUiState) => {
              return {
                ...prevIndexUiState,
                query: value,
              }
            })
          }}
          placeholder="Search documentation..."
        />
      )}
      <Command.List>
        {activePage === 'documentation' && <Hits hitComponent={Hit} />}
        {activePage === 'home' && (
          <>
            <Command.Group heading="Help">
              <Command.Item
                onSelect={() => {
                  setPages([...pages, 'documentation'])
                  setValue('')
                }}
              >
                <Icon className="text-xs text-center w-6" name={IconAwesomeEnum.BOOK} />
                Search documentation
              </Command.Item>
            </Command.Group>
            {value.length > 0 && (
              <>
                {!isFetched && (
                  <div className="py-2">
                    <LoaderSpinner className="w-4 mx-auto" />
                  </div>
                )}
                {isFetched && (
                  <>
                    <Command.Empty>No results found</Command.Empty>
                    <Command.Group heading="Projects">
                      {data
                        .filter(({ suggestionType }) => suggestionType === 'PROJECT')
                        .map(({ id, name }) => (
                          <Command.Item key={id} onSelect={() => closeSpotlight(ENVIRONMENTS_URL(organizationId, id))}>
                            <span className="inline-flex items-center w-6 h-5">
                              <Icon className="text-xs text-center w-6" name={IconEnum.ENVIRONMENT} />
                            </span>
                            {name}
                          </Command.Item>
                        ))}
                    </Command.Group>
                    <Command.Group heading="Environments">
                      {data
                        .filter(({ suggestionType }) => suggestionType === 'ENVIRONMENT')
                        .map(({ id, name, projectId, projectName, environmentMode }) => (
                          <Command.Item
                            key={id}
                            className="justify-between"
                            onSelect={() => closeSpotlight(SERVICES_URL(organizationId, projectId, id))}
                          >
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center w-4 h-5">
                                <Icon className="text-xs text-center" name={IconAwesomeEnum.LAYER_GROUP} />
                              </span>
                              <span className="text-neutral-350">{projectName}</span>
                              <Icon
                                name={IconAwesomeEnum.CHEVRON_RIGHT}
                                className="text-2xs relative top-[1px] text-neutral-350"
                              />
                              <span>{name}</span>
                            </div>
                            <Badge variant="surface" color="neutral" size="xs">
                              {upperCaseFirstLetter(environmentMode)}
                            </Badge>
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
                            <span className="inline-flex items-center w-4 h-5">
                              <Icon name={serviceType} width={16} />
                            </span>
                            <span className="text-neutral-350">{projectName}</span>
                            <Icon
                              name={IconAwesomeEnum.CHEVRON_RIGHT}
                              className="text-2xs relative top-[1px] text-neutral-350"
                            />
                            <span className="text-neutral-350">{environmentName}</span>
                            <Icon
                              name={IconAwesomeEnum.CHEVRON_RIGHT}
                              className="text-2xs relative top-[1px] text-neutral-350"
                            />
                            <span>{name}</span>
                          </Command.Item>
                        ))}
                    </Command.Group>
                  </>
                )}
              </>
            )}
          </>
        )}
      </Command.List>
    </Command.Dialog>
  )
}

export default Spotlight
