import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from 'cmdk'
import { type ComponentPropsWithoutRef, useState } from 'react'
import { Icon } from '@qovery/shared/ui'

const defaultFilters = [
  {
    value: 'severity:',
    label: 'severity:',
  },
  {
    value: 'level:',
    label: 'level:',
  },
  {
    value: 'service:',
    label: 'service:',
  },
]

const detailFilters = [
  {
    key: 'severity',
    options: [
      {
        value: 'error',
        label: 'error',
      },
      {
        value: 'warn',
        label: 'warning',
      },
      {
        value: 'info',
        label: 'info',
      },
    ],
  },
  {
    key: 'service',
    options: [
      {
        value: 'api',
        label: 'API Service',
      },
      {
        value: 'database',
        label: 'Database',
      },
      {
        value: 'cache',
        label: 'Cache',
      },
    ],
  },
]
const highlightFilters = (text: string) => {
  if (!text) return `<span>${text}</span>`
  const filterRegex = /(\w+:[^\s]*)/g
  return text.replace(filterRegex, (match) => {
    return `<span class="bg-neutral-500 whitespace-nowrap rounded-[4px] -ml-[5px] pl-1.5 pr-1">${match}</span>`
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

export function SearchServiceLogs() {
  const [value, setValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If space is pressed, refresh suggestions to exclude existing values
    if (e.key === ' ') {
      // Small delay to ensure the space is added before filtering
      setTimeout(() => {
        setIsOpen(true)
      }, 10)
    }
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
          '--word-gap': value ? '10px' : '0px',
        } as React.CSSProperties
      }
    >
      <Command shouldFilter={false}>
        <div className="relative flex h-9 w-full items-center gap-2 text-sm text-white">
          <Icon iconName="magnifying-glass" iconStyle="regular" className="absolute left-3 text-neutral-250" />
          <CommandInput
            placeholder="Search logs..."
            className="relative -top-[1px] z-10 h-full w-full rounded border border-neutral-400 bg-transparent pl-10 outline-none transition-colors placeholder:text-neutral-250 hover:border-neutral-350 focus:border-neutral-350"
            value={value}
            onValueChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onKeyUp={(e) => {
              const target = e.target as HTMLInputElement
              handleInputChange(value, target.selectionStart ?? undefined)
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            style={{
              wordSpacing: 'var(--word-gap)',
              background: '0 0',
            }}
          />
          <div
            className="pointer-events-none absolute left-0 top-0 z-0 flex h-9 w-fit items-center border border-transparent px-10 text-sm text-transparent"
            style={{
              gap: 'var(--word-gap)',
              transform: 'translateX(0px)',
            }}
            dangerouslySetInnerHTML={{ __html: highlightFilters(value) }}
          />
        </div>
        {isOpen && (
          <CommandList className="absolute left-0 right-0 top-full z-10 mt-2 max-h-60 overflow-auto rounded-md border border-neutral-400 bg-neutral-600 p-1.5 text-sm shadow-lg">
            <CommandEmpty>No logs found.</CommandEmpty>
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
