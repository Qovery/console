import { type ChangeEvent, type KeyboardEvent, useCallback, useDeferredValue, useState } from 'react'
import { Hits, SearchBox, useInstantSearch } from 'react-instantsearch'
import { useIntercom } from 'react-use-intercom'
import { Command, type CommandDialogProps, Icon, IconAwesomeEnum, commandInputStyle } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import Hit from '../hit/hit'

export interface SpotlightProps extends Pick<CommandDialogProps, 'open' | 'onOpenChange'> {}

export function Spotlight({ open, onOpenChange }: SpotlightProps) {
  const [value, setValue] = useState('')
  const [pages, setPages] = useState<string[]>(['home'])
  const activePage = pages[pages.length - 1]

  const { setIndexUiState, indexUiState } = useInstantSearch()
  const { showMessages: showIntercomMessenger } = useIntercom()
  const valueDoc = useDeferredValue(indexUiState.query ?? '')

  const popPage = useCallback(() => {
    setPages((pages) => {
      const x = [...pages]
      x.splice(-1, 1)
      return x
    })
  }, [])

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
      shouldFilter={false}
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
              <Command.Item onSelect={showIntercomMessenger}>
                <Icon className="text-xs text-center w-6" name={IconAwesomeEnum.CIRCLE_QUESTION} />
                Contact support
              </Command.Item>
            </Command.Group>
          </>
        )}
      </Command.List>
    </Command.Dialog>
  )
}

export default Spotlight
