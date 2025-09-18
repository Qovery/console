import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from 'cmdk'
import { type ComponentPropsWithoutRef, useEffect, useMemo, useRef, useState } from 'react'
import { useQueryParams } from 'use-query-params'
import { Icon } from '@qovery/shared/ui'
import { queryParamsServiceLogs } from '../list-service-logs/service-logs-context/service-logs-context'

const defaultFilters = [
  {
    value: 'level:',
    label: 'level:',
  },
  {
    value: 'instance:',
    label: 'instance:',
  },
  {
    value: 'container:',
    label: 'container:',
  },
  {
    value: 'version:',
    label: 'version:',
  },
  {
    value: 'message:',
    label: 'message:',
  },
]

const detailFilters = [
  {
    key: 'level',
    options: [
      {
        label: 'error',
        value: 'error',
      },
      {
        label: 'warning',
        value: 'warning',
      },
      {
        label: 'info',
        value: 'info',
      },
    ],
  },
]
const highlightFilters = (text: string) => {
  if (!text) return `<span>${text}</span>`
  const filterRegex = /(\w+:[^\s]*)/g
  return text.replace(filterRegex, (match) => {
    return `<span class="bg-neutral-500 whitespace-nowrap rounded -ml-[5px] pl-1.5 pr-1">${match}</span>`
  })
}

interface ItemProps extends ComponentPropsWithoutRef<typeof CommandItem> {
  label: string
  setValue: (value: string) => void
  setIsOpen: (isOpen: boolean) => void
}

function Item({ value, label, setValue, setIsOpen }: ItemProps) {
  return (
    <CommandItem
      className="flex h-10 cursor-pointer items-center rounded-sm p-1.5 transition-colors hover:bg-neutral-400 data-[selected=true]:bg-neutral-400"
      value={value}
      onSelect={(currentValue) => {
        setValue(currentValue)
        setIsOpen(false)
      }}
    >
      <span className="whitespace-nowrap rounded-[4px] bg-neutral-500 p-1 pt-0.5">{label}</span>
    </CommandItem>
  )
}

interface ConfirmItemProps extends ComponentPropsWithoutRef<typeof CommandItem> {
  onConfirm: () => void
}

function ConfirmItem({ onConfirm }: ConfirmItemProps) {
  return (
    <CommandItem
      className="flex h-10 cursor-pointer items-center gap-2 rounded-sm p-1.5 pl-2.5 transition-colors hover:bg-neutral-400 data-[selected=true]:bg-neutral-400"
      value="confirm-search"
      onSelect={onConfirm}
    >
      <Icon iconName="arrow-turn-down-right" iconStyle="regular" className="relative top-[1px]" />
      Confirm search
    </CommandItem>
  )
}

function buildValue(queryParams: { [key: string]: string | null | undefined }) {
  let value = ''

  if (queryParams['level']) {
    value += `level:${queryParams['level']} `
  }
  if (queryParams['instance']) {
    value += `instance:${queryParams['instance']} `
  }
  if (queryParams['container']) {
    value += `container:${queryParams['container']} `
  }
  if (queryParams['version']) {
    value += `version:${queryParams['version']} `
  }
  if (queryParams['message']) {
    value += `message:${queryParams['message']} `
  }

  return value.trim()
}

function buildQueryParams(value: string) {
  const filterRegex = /(\w+):([^\s]*)/g
  const matches = value.match(filterRegex)

  if (!matches) return {}

  const queryParams: { [key: string]: string } = {}

  matches.forEach((match) => {
    const parts = match.split(':')
    const filterKey = parts[0]
    const filterValue = parts[1] || ''

    const isValidFilter = defaultFilters.some((filter) => filter.value.replace(':', '') === filterKey)

    if (isValidFilter && filterValue) {
      queryParams[filterKey] = filterValue
    }
  })

  return queryParams
}

export function SearchServiceLogs() {
  const [queryParams, setQueryParams] = useQueryParams(queryParamsServiceLogs)
  const [value, setValue] = useState<string>(buildValue(queryParams))
  const [isOpen, setIsOpen] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync the input value with query params only when query params change
  const queryParamsValue = useMemo(() => buildValue(queryParams), [queryParams])
  useEffect(() => {
    setValue(queryParamsValue)
  }, [queryParamsValue])

  const getContextualSuggestions = () => {
    const beforeCursor = value.substring(0, cursorPosition)

    const filterMatch = beforeCursor.match(/(\w+):\s*([^\s]*)$/)
    if (!filterMatch) return []

    const filterKey = filterMatch[1]
    const partialValue = filterMatch[2] || ''

    const filter = detailFilters.find((f) => f.key === filterKey)

    if (!filter) return []

    const existingValues = getExistingFilterValues(filterKey)

    return filter.options.filter((option) => {
      const matchesPartial = option.value.toLowerCase().includes(partialValue.toLowerCase())
      const notAlreadyUsed = !existingValues.includes(option.value)
      return matchesPartial && notAlreadyUsed
    })
  }

  const getExistingFilterValues = (filterKey: string) => {
    const filterRegex = new RegExp(`${filterKey}:\\s*([^\\s]+)`, 'g')
    const matches = value.match(filterRegex)

    if (!matches) return []

    return matches
      .map((match) => {
        const valuePart = match.split(':')[1]?.trim()
        return valuePart || ''
      })
      .filter(Boolean)
  }

  const hasContextualSuggestions = () => {
    const beforeCursor = value.substring(0, cursorPosition)
    return /(\w+):\s*[^\s]*$/.test(beforeCursor)
  }

  const handleInputChange = (newValue: string, cursorPos?: number) => {
    setValue(newValue)
    setIsOpen(true)

    const pos = cursorPos ?? newValue.length
    setCursorPosition(pos)
  }

  const clearInput = () => {
    setQueryParams({
      level: undefined,
      instance: undefined,
      container: undefined,
      version: undefined,
      message: undefined,
    })
    setValue('')
    setIsOpen(false)
  }

  const confirmSearch = () => {
    inputRef.current?.blur()

    if (value?.length > 0) {
      const builtQueryParams = buildQueryParams(value)
      setQueryParams(builtQueryParams)
      setIsOpen(false)
    } else {
      clearInput()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If space is pressed, refresh suggestions to exclude existing values
    if (e.key === ' ') {
      // Small delay to ensure the space is added before filtering
      setTimeout(() => setIsOpen(true), 10)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement
    setScrollLeft(target.scrollLeft)
  }

  const insertFilterValue = (filterValue: string) => {
    const beforeCursor = value.substring(0, cursorPosition)
    const filterMatch = beforeCursor.match(/(\w+):\s*([^\s]*)$/)

    if (filterMatch) {
      const filterKey = filterMatch[1]
      const beforeFilter = beforeCursor.substring(0, beforeCursor.indexOf(filterKey + ':'))
      const afterCursor = value.substring(cursorPosition)

      const newValue = beforeFilter + filterKey + ':' + filterValue + afterCursor
      setValue(newValue)
      setIsOpen(false)
    }
  }

  return (
    <div
      className="relative w-full"
      style={
        {
          '--word-gap': value ? '8px' : '0px',
        } as React.CSSProperties
      }
    >
      <Command shouldFilter={false}>
        <div className="relative flex h-9 w-full items-center gap-2 text-sm text-white">
          <div className="relative -left-1 h-full w-full overflow-hidden pr-1">
            <CommandInput
              ref={inputRef}
              placeholder="Search logs..."
              className="relative left-1 z-10 h-full w-full overflow-x-auto rounded border border-neutral-400 bg-transparent pl-10 outline-none transition-colors placeholder:text-neutral-250 hover:border-neutral-350 focus:border-neutral-350"
              value={value}
              onValueChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              onKeyUp={(e) => {
                const target = e.target as HTMLInputElement
                handleInputChange(value, target.selectionStart ?? undefined)
              }}
              onClick={() => setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
              style={{
                wordSpacing: 'var(--word-gap)',
                background: '0 0',
              }}
            />
            <div
              className="pointer-events-none absolute left-1 top-0 z-0 flex h-9 w-fit items-center border border-transparent px-10 text-sm text-transparent"
              style={{
                gap: '7px',
                transform: `translateX(-${scrollLeft}px)`,
              }}
              dangerouslySetInnerHTML={{ __html: highlightFilters(value) }}
            />
          </div>
          <div className="absolute left-0 flex h-full w-9 items-center justify-center bg-neutral-600">
            <Icon iconName="magnifying-glass" iconStyle="regular" className="ml-0.5 mt-[1px] text-neutral-250" />
          </div>
        </div>
        {isOpen && (
          <CommandList className="absolute left-0 right-0 top-full z-10 mt-2 max-h-60 overflow-auto rounded-md border border-neutral-400 bg-neutral-600 p-1.5 text-sm shadow-lg">
            <CommandEmpty>No logs found.</CommandEmpty>
            <CommandGroup>
              <ConfirmItem onConfirm={confirmSearch} />

              {/* Contextual suggestions */}
              {hasContextualSuggestions() &&
                getContextualSuggestions().map((option) => (
                  <Item
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    setValue={insertFilterValue}
                    setIsOpen={setIsOpen}
                  />
                ))}

              {/* Default filters */}
              {!hasContextualSuggestions() &&
                defaultFilters
                  .filter((filter) => filter.label.toLowerCase().includes(value.toLowerCase()))
                  .map((filter) => (
                    <Item
                      key={filter.value}
                      value={filter.value}
                      label={filter.label}
                      setValue={setValue}
                      setIsOpen={setIsOpen}
                    />
                  ))}
            </CommandGroup>
          </CommandList>
        )}
      </Command>
    </div>
  )
}

export default SearchServiceLogs
