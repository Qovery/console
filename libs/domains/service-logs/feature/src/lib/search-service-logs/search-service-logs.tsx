import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from 'cmdk'
import { type ComponentPropsWithoutRef, useEffect, useMemo, useRef, useState } from 'react'
import { type DecodedValueMap } from 'serialize-query-params'
import { useQueryParams } from 'use-query-params'
import { Icon } from '@qovery/shared/ui'
import { queryParamsServiceLogs } from '../list-service-logs/service-logs-context/service-logs-context'

const defaultFilters = [
  {
    value: 'level:',
    label: 'level:',
    description: '[debug, info, warning, error]',
  },
  {
    value: 'instance:',
    label: 'instance:',
    description: '[instance id]',
  },
  {
    value: 'container:',
    label: 'container:',
    description: '[container name]',
  },
  {
    value: 'version:',
    label: 'version:',
    description: '[version name]',
  },
  {
    value: 'message:',
    label: 'message:',
    description: '[what you want to search for]',
  },
  {
    value: 'nginx:true',
    label: 'nginx:',
    description: '[activate nginx logs]',
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
  const filterRegex = /(\w+[:][^\s]*)/g
  return text.replace(filterRegex, (match) => {
    return `<span class="bg-neutral-500 whitespace-nowrap rounded p-1">${match}</span>`
  })
}

interface ItemProps extends ComponentPropsWithoutRef<typeof CommandItem> {
  label: string
  setValue: (value: string) => void
  setIsOpen: (isOpen: boolean) => void
  description?: string
}

function Item({ value, label, setValue, setIsOpen, description }: ItemProps) {
  return (
    <CommandItem
      className="group flex h-10 cursor-pointer items-center gap-2 rounded-sm p-1.5 hover:bg-neutral-400 data-[selected=true]:bg-neutral-400"
      value={value}
      onSelect={(currentValue) => {
        setValue(currentValue)
        setIsOpen(false)
      }}
    >
      <span className="whitespace-nowrap rounded-[4px] bg-neutral-500 p-1 pt-0.5">{label}</span>
      {description && (
        <span className="hidden text-xs text-neutral-300 group-data-[selected=true]:inline">{description}</span>
      )}
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

function buildValue(queryParams: DecodedValueMap<typeof queryParamsServiceLogs>) {
  let value = ''

  if (queryParams.level) {
    value += `level:${queryParams.level} `
  }
  if (queryParams.instance) {
    value += `instance:${queryParams.instance} `
  }
  if (queryParams.container) {
    value += `container:${queryParams.container} `
  }
  if (queryParams.version) {
    value += `version:${queryParams.version} `
  }
  if (queryParams.message) {
    value += `message:${queryParams.message} `
  }
  if (queryParams.nginx) {
    value += `nginx:true `
  }
  if (queryParams.search) {
    value += `${queryParams.search} `
  }

  return value.trim()
}

function buildQueryParams(value: string) {
  const filterRegex = /(\w+)[:]([^\s]*)/g
  const matches = value.match(filterRegex)
  const queryParams: DecodedValueMap<typeof queryParamsServiceLogs> = {
    startDate: undefined,
    endDate: undefined,
    level: undefined,
    instance: undefined,
    container: undefined,
    version: undefined,
    message: undefined,
    nginx: undefined,
    search: undefined,
  }

  if (matches) {
    matches.forEach((match) => {
      const parts = match.split(/[:]/)
      const filterKey = parts[0]
      const filterValue = parts[1] || ''

      const isValidFilter = defaultFilters.some((filter) => filter.value.replace(/[:]/, '') === filterKey)

      if (isValidFilter && filterValue) {
        const typedQueryParams = queryParams as Record<string, string | boolean | undefined>
        typedQueryParams[filterKey] = filterValue
      }
      if (filterKey === 'nginx') {
        queryParams.nginx = true
      }
    })
  }

  const textWithoutFilters = value.replace(filterRegex, '').trim()
  if (textWithoutFilters) {
    queryParams.search = textWithoutFilters
  }

  return queryParams
}

export function SearchServiceLogs({ isLoading }: { isLoading: boolean }) {
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

    const filterMatch = beforeCursor.match(/(\w+)[:]\s*([^\s]*)$/)
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
    const filterRegex = new RegExp(`${filterKey}[:]\\s*([^\\s]+)`, 'g')
    const matches = value.match(filterRegex)

    if (!matches) return []

    return matches
      .map((match) => {
        const valuePart = match.split(/[:]/)[1]?.trim()
        return valuePart || ''
      })
      .filter(Boolean)
  }

  const hasContextualSuggestions = () => {
    const beforeCursor = value.substring(0, cursorPosition)
    return /(\w+)[:]\s*[^\s]*$/.test(beforeCursor)
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
      nginx: undefined,
      search: undefined,
    })
    setValue('')
    setIsOpen(false)
  }

  const confirmSearch = () => {
    inputRef.current?.blur()

    if (value?.length > 0) {
      const builtQueryParams = buildQueryParams(value)
      setQueryParams({
        ...builtQueryParams,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
      })
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
    const filterMatch = beforeCursor.match(/(\w+)[:]\s*([^\s]*)$/)

    if (filterMatch) {
      const filterKey = filterMatch[1]
      const separator = filterKey === 'nginx' ? '=' : ':'
      const beforeFilter = beforeCursor.substring(0, beforeCursor.indexOf(filterKey + separator))
      const afterCursor = value.substring(cursorPosition)

      const newValue = beforeFilter + filterKey + separator + filterValue + afterCursor
      setValue(newValue)
      setIsOpen(false)
    }
  }

  const insertFilter = (filterValue: string) => {
    const beforeCursor = value.substring(0, cursorPosition)
    const afterCursor = value.substring(cursorPosition)

    // Find the last space to determine where the current word starts
    const lastSpaceIndex = beforeCursor.lastIndexOf(' ')

    // Remove the current word and add the new filter
    const beforeCurrentWord = lastSpaceIndex >= 0 ? beforeCursor.substring(0, lastSpaceIndex + 1) : ''

    // Add space before if there's already content and no space at the end
    const prefix = beforeCurrentWord && !beforeCurrentWord.endsWith(' ') ? ' ' : ''

    const newValue = beforeCurrentWord + prefix + filterValue + afterCursor
    const newCursorPosition = (beforeCurrentWord + prefix + filterValue).length

    setValue(newValue)
    setCursorPosition(newCursorPosition)
    setIsOpen(true)

    // Position the cursor in the input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition)
      }
    }, 0)
  }

  return (
    <div className="relative w-full">
      <Command shouldFilter={false}>
        <div className="relative flex h-9 w-full items-center gap-2 overflow-hidden text-sm text-white">
          <div className="h-full w-full pr-1">
            <div
              className="pointer-events-none absolute left-0 top-0 z-0 flex h-9 w-fit items-center border border-transparent px-10 text-sm text-transparent"
              style={{
                gap: value ? '0.25rem' : '0px',
                transform: `translateX(-${scrollLeft}px)`,
              }}
              dangerouslySetInnerHTML={{ __html: highlightFilters(value) }}
            />
            <CommandInput
              ref={inputRef}
              placeholder="Search logs…"
              className="absolute h-full w-full overflow-x-auto rounded border border-neutral-400 bg-transparent pl-11 outline-none transition-colors placeholder:text-neutral-250 hover:border-neutral-350 focus:border-neutral-350"
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
                wordSpacing: value ? '0.5rem' : 0,
                background: '0 0',
              }}
            />
            {value.length > 0 && (
              <button
                className="absolute bottom-[1px] right-[1px] flex h-[34px] w-6 items-center justify-start rounded-r border-transparent bg-neutral-600 text-neutral-50 before:absolute before:-left-7 before:top-0 before:block before:h-full before:w-7 before:bg-gradient-to-r before:from-transparent before:to-neutral-600 before:content-[''] hover:text-neutral-250"
                onClick={clearInput}
              >
                <Icon iconName="xmark" className="relative top-[1px]" />
              </button>
            )}
          </div>
          <div className="absolute bottom-[1px] left-[1px] flex h-[34px] w-7 items-center justify-end rounded-l bg-neutral-600 after:absolute after:-right-[12px] after:top-0 after:block after:h-full after:w-3 after:bg-neutral-600 after:content-['']">
            {isLoading ? (
              <Icon iconName="loader" iconStyle="regular" className="ml-0.5 mt-[1px] animate-spin text-neutral-250" />
            ) : (
              <Icon iconName="magnifying-glass" iconStyle="regular" className="ml-0.5 mt-[1px] text-neutral-250" />
            )}
          </div>
        </div>
        {isOpen && (
          <CommandList className="absolute left-0 right-0 top-full z-10 mt-2 max-h-60 overflow-auto rounded-md border border-neutral-400 bg-neutral-600 p-1.5 text-sm shadow-lg">
            <CommandGroup>
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
                  .filter((filter) => {
                    // Get the current word being typed (text after the last space before cursor)
                    const beforeCursor = value.substring(0, cursorPosition)
                    const lastSpaceIndex = beforeCursor.lastIndexOf(' ')
                    const currentWord = lastSpaceIndex >= 0 ? beforeCursor.substring(lastSpaceIndex + 1) : beforeCursor
                    return filter.label.toLowerCase().includes(currentWord.toLowerCase())
                  })
                  .map((filter) => (
                    <Item
                      key={filter.value}
                      value={filter.value}
                      label={filter.label}
                      description={filter.description}
                      setValue={insertFilter}
                      setIsOpen={setIsOpen}
                    />
                  ))}
              <ConfirmItem onConfirm={confirmSearch} />
            </CommandGroup>
          </CommandList>
        )}
      </Command>
    </div>
  )
}

export default SearchServiceLogs
