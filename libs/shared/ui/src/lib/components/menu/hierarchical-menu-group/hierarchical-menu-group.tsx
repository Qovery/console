import { useEffect, useState } from 'react'
import { type FilterLevel, type FilterLevelItem } from '../../../utils/target-type-filter-utils'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'
import InputSearch from '../../inputs/input-search/input-search'

export interface HierarchicalMenuGroupProps {
  currentLevel: FilterLevel // Current level to display
  isLoading?: boolean
  onSelectItem: (item: FilterLevelItem) => void // User selects an item
  onBack?: () => void // Go back to previous level
  canGoBack?: boolean // Whether back navigation is available
  currentValue?: string // Current selected value for this level (to show checkmark)
  paddingMenuY?: number
  paddingMenuX?: number
}

export function HierarchicalMenuGroup({
  currentLevel,
  isLoading = false,
  onSelectItem,
  onBack,
  canGoBack = false,
  currentValue,
  paddingMenuX = 8,
  paddingMenuY = 8,
}: HierarchicalMenuGroupProps) {
  const [filteredItems, setFilteredItems] = useState<FilterLevelItem[]>(currentLevel.items)
  const [currentSearch, setCurrentSearch] = useState('')

  // Update filtered items when level or search changes
  useEffect(() => {
    // Reset search when level changes
    setCurrentSearch('')

    const filtered = currentLevel.items.filter((item) => {
      if (!item.label) return true
      return item.label.toUpperCase().includes(currentSearch.toUpperCase())
    })

    // Sort alphabetically if search is enabled (following existing pattern)
    const sorted = currentLevel.hasSearch ? [...filtered].sort((a, b) => a.label.localeCompare(b.label)) : filtered
    setFilteredItems(sorted)
  }, [currentLevel.items, currentLevel.hasSearch])

  // Update filtered items when search changes
  useEffect(() => {
    const filtered = currentLevel.items.filter((item) => {
      if (!item.label) return true
      return item.label.toUpperCase().includes(currentSearch.toUpperCase())
    })

    // Sort alphabetically if search is enabled (following existing pattern)
    const sorted = currentLevel.hasSearch ? [...filtered].sort((a, b) => a.label.localeCompare(b.label)) : filtered
    setFilteredItems(sorted)
  }, [currentSearch])

  const paddingStyle = {
    paddingTop: paddingMenuY,
    paddingBottom: paddingMenuY,
    paddingLeft: paddingMenuX,
    paddingRight: paddingMenuX,
  }

  const headPaddingStyle = {
    paddingTop: paddingMenuY,
    paddingLeft: paddingMenuX,
    paddingRight: paddingMenuX,
  }

  return (
    <div>
      {/* Back button */}
      {canGoBack && onBack && (
        <div
          style={headPaddingStyle}
          className="flex cursor-pointer items-center gap-2 border-b border-neutral-200 pb-2 hover:text-brand-500 dark:border-neutral-600"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onBack()
          }}
        >
          <Icon name={IconAwesomeEnum.CHEVRON_LEFT} className="text-sm text-neutral-350" />
          <span className="text-sm font-medium text-neutral-400 dark:text-neutral-300">Back</span>
        </div>
      )}

      {/* Level title */}
      {currentLevel.title && (
        <div style={headPaddingStyle} className="border-b border-neutral-200 dark:border-neutral-600">
          <p className="pb-2 text-sm font-medium text-neutral-400 dark:text-neutral-300">{currentLevel.title}</p>
        </div>
      )}

      {/* Search box */}
      {currentLevel.hasSearch && !isLoading && (
        <div className="menu__search" style={headPaddingStyle} data-testid="hierarchical-menu-search">
          <InputSearch
            autofocus
            className="dark:bg-neutral-600"
            placeholder="Search"
            isEmpty={filteredItems.length === 0}
            onChange={(value: string) => {
              setCurrentSearch(value)
            }}
          />
        </div>
      )}

      {/* Items list or loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8" style={paddingStyle}>
          <div className="flex flex-col items-center gap-2">
            <div className="aspect-square w-6 animate-spin rounded-full border-2 border-solid border-b-transparent border-l-transparent border-r-brand-500 border-t-transparent" />
            <p className="text-sm text-neutral-350">Loading...</p>
          </div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div style={paddingStyle} className="max-h-80 overflow-y-auto">
          {filteredItems.map((item, index) => {
            const isSelected = currentValue === item.id
            const isAllOption = item.id === 'ALL'

            return (
              <div
                key={index}
                className="menu-item flex cursor-pointer items-center justify-between px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onSelectItem(item)
                }}
              >
                <div className="flex items-center truncate">
                  <span className="mr-3 flex items-center">
                    {isSelected ? (
                      <Icon name={IconAwesomeEnum.CHECK} className="text-sm text-green-400" />
                    ) : isAllOption ? (
                      <Icon name={IconAwesomeEnum.CHECK} className="text-sm text-transparent" />
                    ) : (
                      <Icon name={IconAwesomeEnum.CHEVRON_RIGHT} className="text-sm text-neutral-350" />
                    )}
                  </span>
                  <span className="truncate text-sm font-medium text-neutral-400 dark:text-neutral-100">
                    {item.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-8 text-center" style={paddingStyle}>
          <p className="text-sm text-neutral-350">No items found</p>
        </div>
      )}
    </div>
  )
}

export default HierarchicalMenuGroup
