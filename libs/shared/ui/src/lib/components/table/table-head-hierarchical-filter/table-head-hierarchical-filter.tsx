import { type Dispatch, type MouseEvent, type SetStateAction, useEffect, useRef, useState } from 'react'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { Button } from '../../button/button'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'
import Menu from '../../menu/menu'
import menu from '../../menu/menu'
import { type MenuItemProps } from '../../menu/menu-item/menu-item'
import { type HierarchicalFilterResult, type TableFilterProps } from '../table'

export interface TableHeadHierarchicalFilterProps {
  title: string
  classNameTitle?: string
  initialData: HierarchicalMenuItem[]
  initialSelectedItems?: SelectedItem[]
  initialNavigationStack?: NavigationLevel[]
  initialLevel?: number
  filterKey: string
  onLoadMenusToDisplay: (
    selectedItems: SelectedItem[],
    navigationStack: NavigationLevel[]
  ) => Promise<HierarchicalFilterResult | null>
  onSelectionChange: (selectedItems: SelectedItem[]) => void
  computeDisplayByLabel: (filterKey: string, selectedItem?: SelectedItem) => string
  setFilter: Dispatch<SetStateAction<TableFilterProps[]>>
  filter: TableFilterProps[]
}

// This represents a level of navigation in the hierarchical filter menu
// - items are what menu items are shown in the menu
// - filterKey is the associated key used as a filter for this level
export interface NavigationLevel {
  items: HierarchicalMenuItem[]
  filterKey: string
}

export interface SelectedItem {
  filterKey: string
  item: HierarchicalMenuItem
}

export interface HierarchicalMenuItem {
  value: string
  name: string
}

function initializeInitialData(initialData: HierarchicalMenuItem[], filterKey: string): NavigationLevel[] {
  return [{ items: [{ value: 'ALL', name: 'All' }, ...initialData], filterKey: filterKey }]
}

/**
 * @deprecated Prefer TablePrimitives + tanstack-table for type-safety and documentation
 */
export function TableHeadHierarchicalFilter({
  title,
  classNameTitle,
  initialData,
  initialSelectedItems,
  initialNavigationStack,
  initialLevel,
  filterKey,
  onLoadMenusToDisplay,
  onSelectionChange,
  computeDisplayByLabel,
  setFilter,
  filter,
}: TableHeadHierarchicalFilterProps) {
  const [isOpen, setOpen] = useState(false)
  const [level, setLevel] = useState(0)
  const [navigationStack, setNavigationStack] = useState<NavigationLevel[]>(
    initializeInitialData(initialData, filterKey)
  )
  const selectedItemsRef = useRef<SelectedItem[]>([])
  const hasInitialized = useRef(false)

  const [isLoading, setIsLoading] = useState(false)

  const [hasFilter, setHasFilter] = useState(false)
  useEffect(() => {
    setHasFilter(filter?.some((item) => item.key === filterKey && item.value !== 'ALL'))
  }, [filter])

  // Initialize from pre-built navigation stack (if available)
  useEffect(() => {
    if (hasInitialized.current) {
      return
    }

    // If we have a pre-built navigation stack, use it directly to avoid fetching
    if (initialNavigationStack && initialLevel !== undefined && initialSelectedItems) {
      hasInitialized.current = true
      selectedItemsRef.current = initialSelectedItems
      setNavigationStack(initialNavigationStack)
      setLevel(initialLevel)
      return
    }

    // Fallback: no pre-built data, nothing to initialize
    if (!initialSelectedItems || initialSelectedItems.length === 0) {
      return
    }

    hasInitialized.current = true
    selectedItemsRef.current = initialSelectedItems
  }, [initialNavigationStack, initialLevel, initialSelectedItems])

  const isDark = document.documentElement.classList.contains('dark')

  // Get current navigation level
  const currentNavigationLevel = navigationStack[navigationStack.length - 1]
  const isRootLevel = navigationStack.length === 1

  // Handle going back in navigation
  const handleBack = () => {
    if (navigationStack.length > 1) {
      // const filterKeyToRemove = navigationStack[navigationStack.length - 2].filterKey
      const filterKeyToRemove = selectedItemsRef.current[selectedItemsRef.current.length - 1].filterKey
      setLevel(level - 1)
      setNavigationStack((prev) => prev.slice(0, -1))
      selectedItemsRef.current = selectedItemsRef.current.slice(0, -1)
      setFilter((prev) => {
        return prev.map((p) => {
          // Put explicitly 'ALL' when going back for the last filter applied
          if (p.key === filterKeyToRemove) {
            return { key: filterKeyToRemove, value: 'ALL' }
          } else {
            return p
          }
        })
      })
      // Keep menu open when going back
      setOpen(true)
    }
  }

  // Handle item click
  const handleItemClick = async (item: HierarchicalMenuItem) => {
    setIsLoading(true)
    // Keep menu open during async operation
    setOpen(true)
    // Set internal selected items
    selectedItemsRef.current = [
      ...selectedItemsRef.current.filter((prev) => prev.filterKey !== currentNavigationLevel.filterKey),
      { item: item, filterKey: currentNavigationLevel.filterKey },
    ]
    onSelectionChange(selectedItemsRef.current)

    try {
      const result = await onLoadMenusToDisplay(selectedItemsRef.current, navigationStack)

      // Apply the filter of the item clicked
      const filterToApply: TableFilterProps = {
        key: currentNavigationLevel.filterKey,
        value: item.value,
      }
      setFilter((prev) => {
        // We need to remove first the filter if it is already applied
        const filterRemovedOfCurrentFilterKey = prev.filter((p) => p.key !== currentNavigationLevel.filterKey)
        return [...filterRemovedOfCurrentFilterKey, filterToApply]
      })

      // The last possible element in the hierarchy has been selected, so close the menu
      if (result == null) {
        setIsLoading(false)
        setOpen(false)
      } else {
        // Drill down to next level
        setNavigationStack((prev) => [...prev, { items: result.items, filterKey: result.filterKey }])
        setLevel(level + 1)
        // Explicitly keep menu open for next level
        setOpen(true)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error fetching hierarchical filter data:', error)
      setIsLoading(false)
    }
  }

  // Build menu items based on current navigation level
  const buildMenuItems = (): MenuItemProps[] => {
    const items: MenuItemProps[] = []

    // Add "Back" button if not at root level
    if (!isRootLevel) {
      items.push({
        name: 'Back',
        contentLeft: <Icon name={IconAwesomeEnum.ARROW_LEFT} className="text-sm text-neutral-400" />,
        onClick: (e) => {
          // Prevent menu from auto-closing
          e.keepOpen = true
          handleBack()
        },
        containerClassName: 'border-b border-neutral-200',
      })
    }

    // Add loading state
    if (isLoading) {
      items.push({
        name: 'Loading...',
        disabled: true,
      })
      return items
    }

    // Build items from current level
    currentNavigationLevel.items.forEach((item) => {
      items.push({
        name: upperCaseFirstLetter(item.name.toLowerCase())?.replace(/_/g, ' '),
        // The check here is needed only for the first level of menu on the 'ALL' case
        contentLeft: (
          <Icon
            name={IconAwesomeEnum.CHECK}
            className={`text-sm ${'ALL' === item.value ? 'text-green-400' : 'text-transparent'}`}
          />
        ),
        // Show ">" icon for all items to indicate they are clickable
        contentRight: <Icon name={IconAwesomeEnum.ARROW_RIGHT} className="text-sm text-neutral-400" />,
        onClick: (e) => {
          // Prevent menu from auto-closing
          e.keepOpen = true
          handleItemClick(item)
        },
      })
    })

    return items
  }

  function cleanFilter(event: MouseEvent) {
    event.preventDefault()
    const allFilterKeysApplied = selectedItemsRef.current.map((selectedItem) => selectedItem.filterKey)
    setFilter((prev) => {
      const removeAppliedFilter = prev.filter((item) => !allFilterKeysApplied.includes(item.key ?? ''))
      const addFiltersAllToPreviousFilters = allFilterKeysApplied.map((filterKey) => {
        return { key: filterKey, value: 'ALL' }
      })
      return [...removeAppliedFilter, ...addFiltersAllToPreviousFilters]
    })

    // Reset navigation state
    setLevel(0)
    setNavigationStack(initializeInitialData(initialData, filterKey))
  }

  const menuItems = buildMenuItems()
  const [filterByLabel, setFilterByLabel] = useState<string>('Target type')

  useEffect(() => {
    const currentNavigation = navigationStack[level]
    if (currentNavigation) {
      const selectedItem = selectedItemsRef.current.length > 0 ? selectedItemsRef.current[0] : undefined
      const filterByLabel = computeDisplayByLabel(currentNavigation.filterKey, selectedItem)
      setFilterByLabel(filterByLabel)
    } else {
      setFilterByLabel('Target Type')
    }
  }, [navigationStack])

  return (
    <div className={`flex items-center ${classNameTitle ?? ''}`}>
      <Menu
        open={isOpen}
        onOpen={(open) => {
          setOpen(open)
        }}
        menus={[
          {
            items: menuItems,
            search: true,
            title: 'Filter by ' + filterByLabel,
          },
        ]}
        width={280}
        isFilter
        trigger={
          <div className="flex">
            {hasFilter ? (
              <Button type="button" size="xs" className="whitespace-nowrap pr-6">
                {title}
              </Button>
            ) : (
              <Button
                type="button"
                variant={isDark ? 'solid' : 'surface'}
                color="neutral"
                size="xs"
                className="items-center gap-1.5"
              >
                {title}
                <Icon iconName="angle-down" className="relative top-[1px]" />
              </Button>
            )}
          </div>
        }
      />
      {hasFilter && (
        <span
          role="button"
          className="relative -left-6 flex h-6 cursor-pointer items-center px-2 text-xs text-neutral-50"
          onClick={(event) => cleanFilter(event)}
        >
          <Icon iconName="xmark" />
        </span>
      )}
    </div>
  )
}

export default TableHeadHierarchicalFilter
