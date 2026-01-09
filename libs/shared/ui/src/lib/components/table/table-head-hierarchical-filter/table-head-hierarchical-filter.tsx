import { p } from 'framer-motion/m'
import { type Dispatch, type MouseEvent, type SetStateAction, useEffect, useRef, useState } from 'react'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { Button } from '../../button/button'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'
import Menu from '../../menu/menu'
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
  onLoadMenusToDisplay: (selectedItems: SelectedItem[]) => Promise<HierarchicalFilterResult | null>
  onSelectionChange: (selectedItems: SelectedItem[]) => void
  computeDisplayByLabel: (filterKey: string, selectedItem?: SelectedItem) => string
  setFilter: Dispatch<SetStateAction<TableFilterProps[]>>
  filter: TableFilterProps[]
  onFilterChange?: (filter: TableFilterProps[], currentSelectedItems: SelectedItem[]) => SelectedItem[]
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
  // This property is only to be able to
  isLeaf?: boolean
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
  onFilterChange,
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

  // Watch filter changes to rebuild navigation stack when badges are removed
  useEffect(() => {
    setHasFilter(filter?.some((item) => item.key === filterKey && item.value !== 'ALL'))

    if (!hasInitialized.current || !onFilterChange) {
      return
    }

    // Call parent's callback to compute new selected items based on filter
    const newSelectedItems = onFilterChange(filter, selectedItemsRef.current).filter(
      (item) => item.item.value !== 'ALL'
    )

    // If filters were removed (fewer selected items)
    if (newSelectedItems.length < selectedItemsRef.current.length) {
      selectedItemsRef.current = newSelectedItems
      onSelectionChange(newSelectedItems)

      // Rebuild navigation stack progressively
      const rebuildStack = async () => {
        setIsLoading(true)
        const stack: NavigationLevel[] = [{ items: [{ value: 'ALL', name: 'All' }, ...initialData], filterKey }]

        try {
          for (let i = 0; i < newSelectedItems.length; i++) {
            const currentItems = newSelectedItems.slice(0, i + 1)
            const result = await onLoadMenusToDisplay(currentItems)

            if (result) {
              stack.push({ items: result.items, filterKey: result.filterKey })
            }
          }

          setNavigationStack(stack)
          setLevel(stack.length - 1)
        } catch (error) {
          console.error('[TableHeadHierarchicalFilter] Error rebuilding navigation stack:', error)
        } finally {
          setIsLoading(false)
        }
      }

      rebuildStack()
    }
  }, [filter])

  const isDark = document.documentElement.classList.contains('dark')

  // Get current navigation level
  const currentNavigationLevel = navigationStack[level]
  const isRootLevel = level === 0

  // Handle going back in navigation
  const handleBack = () => {
    if (navigationStack.length > 1) {
      setLevel(level - 1)
      setOpen(true)
    }
  }

  // Handle item click
  const handleItemClick = async (item: HierarchicalMenuItem) => {
    setIsLoading(true)
    // Keep menu open during async operation
    setOpen(true)

    // If we have some selected items at lower level + other hierarchy is selected, we must clean them
    let filterKeysToReset: string[] = []
    if (selectedItemsRef.current && selectedItemsRef.current.length > level) {
      const selectedItem = selectedItemsRef.current[level]
      // Handle the case where nothing needs to be reload
      if (selectedItem.filterKey === currentNavigationLevel.filterKey && selectedItem.item.value === item.value) {
        setIsLoading(false)
        if (navigationStack.length > level + 1) {
          setLevel(level + 1)
          setOpen(true)
        } else {
          setOpen(false)
        }
        return
      }

      // Compute filter keys to be removed and set properly selected items by removing lower levels.
      filterKeysToReset = selectedItemsRef.current.slice(level + 1).map((item) => item.filterKey)
      selectedItemsRef.current = [
        ...selectedItemsRef.current.slice(0, level),
        { item: item, filterKey: currentNavigationLevel.filterKey },
      ]
    } else {
      // Set internal selected items
      selectedItemsRef.current = [
        ...selectedItemsRef.current.filter((prev) => prev.filterKey !== currentNavigationLevel.filterKey),
        { item: item, filterKey: currentNavigationLevel.filterKey },
      ]
    }
    onSelectionChange(selectedItemsRef.current)

    try {
      const result = await onLoadMenusToDisplay(selectedItemsRef.current)

      // Apply the filter of the item clicked
      const filterToApply: TableFilterProps = {
        key: currentNavigationLevel.filterKey,
        value: item.value,
      }
      setFilter((prev) => {
        // We need to remove first the filter if it is already applied
        const filterRemovedOfCurrentFilterKey = prev.filter(
          (p) => p.key !== currentNavigationLevel.filterKey && !filterKeysToReset.some((f) => f === p.key)
        )
        const enforceFilteredRemoved = filterKeysToReset.map((f) => {
          return { key: f, value: 'ALL' }
        })
        return [...filterRemovedOfCurrentFilterKey, ...enforceFilteredRemoved, filterToApply]
      })

      // The last possible element in the hierarchy has been selected, so close the menu
      if (result == null) {
        setIsLoading(false)
        setOpen(false)
      } else {
        // Drill down to next level
        setNavigationStack((prev) => {
          // Lower levels need to be removed if there are any
          const newNavigationStack = prev.slice(0, level + 1)
          return [...newNavigationStack, { items: result.items, filterKey: result.filterKey }]
        })
        setLevel(level + 1)
        // Explicitly keep menu open for next level
        setOpen(true)
        setIsLoading(false)
      }
    } catch (error) {
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
    let menuItemSelected: HierarchicalMenuItem | undefined = undefined
    if (selectedItemsRef.current && selectedItemsRef.current.length > 0) {
      menuItemSelected = selectedItemsRef.current.find(
        (selectedItem) => selectedItem.filterKey === currentNavigationLevel.filterKey
      )?.item
    }

    currentNavigationLevel.items.forEach((item) => {
      items.push({
        name: upperCaseFirstLetter(item.name.toLowerCase())?.replace(/_/g, ' '),
        // The check here is needed:
        // * for the first level of menu on the 'ALL' case
        // * for existing selected item when using the 'Back' button
        contentLeft: (
          <Icon
            name={IconAwesomeEnum.CHECK}
            className={`text-sm ${('ALL' === item.value && !menuItemSelected) || menuItemSelected?.value === item.value ? 'text-green-400' : 'text-transparent'}`}
          />
        ),
        // Show ">" icon for all items to indicate they are clickable
        contentRight: (
          <Icon
            name={IconAwesomeEnum.ARROW_RIGHT}
            className={`text-sm text-neutral-400 ${!item.isLeaf ? 'text-neutral-400' : 'text-transparent'}`}
          />
        ),
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
  }, [level, navigationStack])

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
