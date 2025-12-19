import { OrganizationEventApi } from 'qovery-typescript-axios'
import { type Dispatch, type MouseEvent, type SetStateAction, useEffect, useState } from 'react'
import { type DecodedValueMap } from 'use-query-params'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import {
  type FilterLevel,
  type FilterLevelItem,
  type HierarchicalFilterState,
  getNextFilterLevel,
  isFinalSelection,
} from '../../../utils/target-type-filter-utils'
import { Button } from '../../button/button'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'
import { HierarchicalMenuGroup } from '../../menu/hierarchical-menu-group'
import Menu from '../../menu/menu'
import { type MenuItemProps } from '../../menu/menu-item/menu-item'
import { type TableFilterProps, type TableHeadCustomFilterProps, type TableHeadProps } from '../table'

// Shared cache for entity ID -> name mappings (in-memory, module-level)
// Moved here to avoid circular dependency with pages-events
export const ENTITY_NAME_CACHE = new Map<string, string>()

export interface TableHeadFilterProps<T> {
  title: string
  dataHead: TableHeadProps<T>
  defaultData: T[]
  setFilter: Dispatch<SetStateAction<TableFilterProps[]>>
  filter: TableFilterProps[]
  classNameTitle?: string
  // For hierarchical filtering (target_type)
  organizationId?: string
  queryParams?: DecodedValueMap<any>
}

export const ALL = 'ALL'

// create multiple filter
// need to output the function for testing
export function createFilter<T>(
  dataHead: TableHeadProps<T>,
  defaultData: T[] | undefined,
  defaultValue = ALL,
  currentFilter: string,
  setCurrentFilter: Dispatch<SetStateAction<string>>,
  setDataFilterNumber: Dispatch<SetStateAction<number>>,
  setFilter: Dispatch<SetStateAction<TableFilterProps[]>>
) {
  const keys: string[] = []
  const menus = []

  // get array of keys
  dataHead?.filter?.filter((currentData) => keys.push(currentData.key))

  // get menu by group of key
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]

    const menu: MenuItemProps[] | undefined =
      defaultData &&
      groupBy(
        defaultData,
        key,
        defaultValue,
        currentFilter,
        setCurrentFilter,
        setDataFilterNumber,
        setFilter,
        dataHead?.filter?.[i]
      )

    if (menu) {
      menus.push({
        title: (dataHead.filter && dataHead.filter[i].title) || undefined,
        search: (dataHead.filter && dataHead.filter[i].search) || false,
        sortAlphabetically: (dataHead.filter && dataHead.filter[i].sortAlphabetically) || false,
        items: menu,
      })
    }
  }

  return menus
}

// group by same value
export function groupBy<T>(
  data: Array<T>,
  property: string,
  defaultValue = ALL,
  currentFilter: string,
  setCurrentFilter: Dispatch<SetStateAction<string>>,
  setDataFilterNumber: Dispatch<SetStateAction<number>>,
  setFilter: Dispatch<SetStateAction<TableFilterProps[]>>,
  dataHeadFilter?: TableHeadCustomFilterProps<T>
) {
  if (dataHeadFilter?.itemsCustom) {
    // custom list without datas from array of string
    const result: MenuItemProps[] = [defaultValue, ...(dataHeadFilter?.itemsCustom ?? {})].map((item: string) => ({
      name: upperCaseFirstLetter(item.toLowerCase())?.replace(/_/g, ' '),
      contentLeft: (
        <Icon
          name={IconAwesomeEnum.CHECK}
          className={`text-sm ${currentFilter === item ? 'text-green-400' : 'text-transparent'}`}
        />
      ),
      onClick: () => {
        if (currentFilter !== item) {
          // set filter
          setCurrentFilter(item)
          setFilter &&
            setFilter((prev) => [
              ...prev.filter((currentValue) => currentValue.key !== property),
              {
                key: property,
                value: item,
              },
            ])
        } else {
          // reset with default filter
          setCurrentFilter(defaultValue)
          setFilter && setFilter([])
        }
      },
    }))

    return result as MenuItemProps[]
  } else {
    const dataByKeys: Record<string, T[]> = data.reduce(
      (acc, obj) => {
        const defaultKey = defaultValue as string

        if (!acc[defaultKey]) {
          acc[defaultKey] = []
        }
        acc[defaultKey].push(obj)

        if (property.includes('.')) {
          const splitProperty = property.split('.')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let nestedObj: any = obj
          let key: string | undefined

          for (const prop of splitProperty) {
            // TODO: `in` looks fishy because that's not the way to use this keyword in js
            nestedObj = nestedObj && prop in nestedObj ? nestedObj[prop] : null
            if (nestedObj === null || nestedObj === undefined) {
              break
            }
          }

          if (nestedObj !== null && nestedObj !== undefined) {
            key = nestedObj as string
          }

          if (key) {
            if (!acc[key]) {
              acc[key] = []
            }
            acc[key].push(obj)
          }
        } else {
          const key: string = obj[property as keyof T] as string

          if (!acc[key]) {
            acc[key] = []
          }
          acc[key].push(obj)
        }

        return acc
      },
      {} as Record<string, T[]>
    )

    if (dataHeadFilter?.itemContentCustom) {
      delete dataByKeys[defaultValue]
    }

    // create menus by keys
    const result: MenuItemProps[] = Object.keys(dataByKeys).map((key: string) => ({
      name: upperCaseFirstLetter(key.toLowerCase())?.replace('_', ' '),
      truncateLimit: 20,
      contentLeft: (
        <Icon
          name={IconAwesomeEnum.CHECK}
          className={`text-sm ${currentFilter === key ? 'text-green-400' : 'text-transparent'}`}
        />
      ),
      contentRight: (
        <span className="rounded-sm bg-neutral-200 px-1 text-xs font-bold text-neutral-350">
          {dataByKeys[key].length}
        </span>
      ),
      // set custom content hide name, contentLeft and contentRight (keep only the onClick)
      itemContentCustom:
        dataHeadFilter?.itemContentCustom && dataHeadFilter?.itemContentCustom(dataByKeys[key][0], currentFilter),
      onClick: () => {
        const currentFilterData = [...dataByKeys[key]]

        if (currentFilter !== key) {
          // set filter when is different of current filter
          setCurrentFilter(key)
          setDataFilterNumber(currentFilterData.length)
          setFilter &&
            setFilter((prev) => [
              ...prev.filter((currentValue) => currentValue.key !== property),
              {
                key: property,
                value: key,
              },
            ])
        } else {
          // reset with default filter
          setCurrentFilter(defaultValue)
          setDataFilterNumber(0)
          setFilter &&
            setFilter((prev) => {
              const result = prev.filter((currentValue) => currentValue.key !== property)
              return [...result, { key: property, value: defaultValue }]
            })
        }
      },
    }))

    return result as MenuItemProps[]
  }
}

/**
 * @deprecated Prefer TablePrimitives + tanstack-table for type-safety and documentation
 */
export function TableHeadFilter<T>({
  title,
  dataHead,
  defaultData,
  filter,
  setFilter,
  classNameTitle,
  organizationId,
  queryParams,
}: TableHeadFilterProps<T>) {
  const [currentFilter, setCurrentFilter] = useState(ALL)

  const hasFilter = filter?.some((item) => item.key === dataHead.filter?.[0].key && item.value !== ALL)

  const [dataFilterNumber, setDataFilterNumber] = useState(hasFilter ? defaultData.length : 0)
  const [isOpen, setOpen] = useState(false)

  const key = dataHead.filter?.[0].key || ''

  // Detect hierarchical filter mode (for target_type)
  const isHierarchicalFilter = key === 'target_type' && organizationId && queryParams

  // Hierarchical filter state
  const [hierarchicalState, setHierarchicalState] = useState<HierarchicalFilterState>({})
  const [currentFilterLevel, setCurrentFilterLevel] = useState<FilterLevel | null>(null)
  const [isLoadingLevel, setIsLoadingLevel] = useState(false)
  // Track navigation history for back button (stack of states)
  const [navigationHistory, setNavigationHistory] = useState<HierarchicalFilterState[]>([])

  useEffect(() => {
    const matchingFilter = filter.find((item) => item.key === key)
    if (matchingFilter && matchingFilter.value !== ALL) {
      setCurrentFilter(matchingFilter.value || ALL)
    } else {
      setCurrentFilter(ALL)
    }
  }, [filter, key])

  // Handler for hierarchical item selection
  const handleHierarchicalItemSelect = async (item: FilterLevelItem) => {
    if (!organizationId || !queryParams) return

    // Handle "All" selection - clear all filters
    if (item.id === 'ALL' && currentFilterLevel?.key === 'targetType') {
      // Clear all hierarchical state
      setHierarchicalState({})
      setCurrentFilterLevel(null)
      setNavigationHistory([])
      setCurrentFilter(ALL)

      // Remove all related filters
      setFilter((prev) =>
        prev.filter((f) => !['target_type', 'project_id', 'environment_id', 'target_id'].includes(f.key || ''))
      )

      // Close menu
      setOpen(false)
      return
    }

    // Push current state to history before moving forward
    setNavigationHistory((prev) => [...prev, hierarchicalState])

    const newState = { ...hierarchicalState }

    // Update state based on current level key
    if (currentFilterLevel?.key === 'targetType') {
      newState.targetType = item.id as any
      // Don't set targetName here - only set it when selecting actual target (targetId level)
    } else if (currentFilterLevel?.key === 'projectId') {
      newState.projectId = item.id
      newState.projectName = item.label
      // Cache project ID -> name mapping
      ENTITY_NAME_CACHE.set(item.id, item.label)
    } else if (currentFilterLevel?.key === 'environmentId') {
      newState.environmentId = item.id
      newState.environmentName = item.label
      // Cache environment ID -> name mapping
      ENTITY_NAME_CACHE.set(item.id, item.label)
    } else if (currentFilterLevel?.key === 'targetId') {
      newState.targetId = item.id
      newState.targetName = item.label
      // Cache target ID -> name mapping
      ENTITY_NAME_CACHE.set(item.id, item.label)
    }

    setHierarchicalState(newState)

    // ALWAYS update the filter immediately (at every step)
    setFilter((prev) => [
      ...prev.filter((f) => !['target_type', 'project_id', 'environment_id', 'target_id'].includes(f.key || '')),
      { key: 'target_type', value: newState.targetType, hierarchical: newState },
    ])
    setCurrentFilter(newState.targetType || ALL)

    // Check if this is the final selection
    if (isFinalSelection(newState)) {
      // Close menu on final selection
      setOpen(false)
      // Reset hierarchical state and history for next time
      setHierarchicalState({})
      setCurrentFilterLevel(null)
      setNavigationHistory([])
    } else {
      // Load next level - show loading while fetching
      // Menu stays open for next selection
      setIsLoadingLevel(true)
      const eventApi = new OrganizationEventApi()
      const nextLevel = await getNextFilterLevel(newState, organizationId, eventApi, queryParams)
      setCurrentFilterLevel(nextLevel)
      setIsLoadingLevel(false)
    }
  }

  // Handler for back navigation
  const handleBack = async () => {
    if (navigationHistory.length === 0 || !organizationId || !queryParams) return

    // Pop the last state from history
    const previousState = navigationHistory[navigationHistory.length - 1]
    setNavigationHistory((prev) => prev.slice(0, -1))
    setHierarchicalState(previousState)

    // Update filter to reflect previous state
    if (Object.keys(previousState).length > 0) {
      setFilter((prev) => [
        ...prev.filter((f) => !['target_type', 'project_id', 'environment_id', 'target_id'].includes(f.key || '')),
        { key: 'target_type', value: previousState.targetType, hierarchical: previousState },
      ])
      setCurrentFilter(previousState.targetType || ALL)
    } else {
      // Going back to root (no filter)
      setFilter((prev) =>
        prev.filter((f) => !['target_type', 'project_id', 'environment_id', 'target_id'].includes(f.key || ''))
      )
      setCurrentFilter(ALL)
    }

    // Load the level for previous state
    // Clean queryParams: override hierarchical params with previousState values
    const cleanQueryParams = {
      ...queryParams,
      targetType: previousState.targetType,
      targetId: previousState.targetId ?? undefined,
      projectId: previousState.projectId ?? undefined,
      environmentId: previousState.environmentId ?? undefined,
    } as any

    setIsLoadingLevel(true)
    const eventApi = new OrganizationEventApi()
    const level = await getNextFilterLevel(previousState, organizationId, eventApi, cleanQueryParams)
    setCurrentFilterLevel(level)
    setIsLoadingLevel(false)
  }

  function cleanFilter(event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    setCurrentFilter(ALL)
    setDataFilterNumber(0)

    if (isHierarchicalFilter) {
      // Clear all hierarchical state
      setHierarchicalState({})
      setCurrentFilterLevel(null)
      setIsLoadingLevel(false)
      setNavigationHistory([])

      // Remove all related filters
      setFilter((prev) =>
        prev.filter((f) => !['target_type', 'project_id', 'environment_id', 'target_id'].includes(f.key || ''))
      )
    } else {
      // Existing simple filter clear logic
      setFilter &&
        setFilter((prev) => {
          const result = prev.filter((currentValue) => currentValue.key !== key)
          return [...result, { key: key, value: ALL }]
        })
    }
  }

  const menus = createFilter(
    dataHead,
    defaultData,
    ALL,
    currentFilter,
    setCurrentFilter,
    setDataFilterNumber,
    setFilter
  )

  const hideFilterNumber: boolean = dataHead.filter?.some((item) => item.hideFilterNumber) || false
  const isDark = document.documentElement.classList.contains('dark')

  return (
    <div className={`flex items-center ${classNameTitle ?? ''}`}>
      <Menu
        open={isOpen}
        onOpen={async (open) => {
          setOpen(open)
          if (open && isHierarchicalFilter && organizationId && queryParams) {
            // Check if there's an existing hierarchical filter to resume from
            const existingFilter = filter.find((f) => f.key === 'target_type' && f.hierarchical)
            const resumeState = existingFilter?.hierarchical || {}

            // If we have a final selection, reset to start (allows user to change selection)
            const shouldReset = resumeState && isFinalSelection(resumeState)
            const stateToLoad = shouldReset ? {} : resumeState

            setHierarchicalState(stateToLoad)

            // Rebuild navigation history based on current state
            const history: HierarchicalFilterState[] = []

            // Root state (empty)
            if (stateToLoad.targetType) {
              history.push({})

              // After selecting target type
              if (stateToLoad.projectId) {
                history.push({
                  targetType: stateToLoad.targetType,
                })

                // After selecting project
                if (stateToLoad.environmentId) {
                  history.push({
                    targetType: stateToLoad.targetType,
                    projectId: stateToLoad.projectId,
                    projectName: stateToLoad.projectName,
                  })
                }
              }
            }

            setNavigationHistory(history)
            setCurrentFilterLevel(null)
            setIsLoadingLevel(true)
            const eventApi = new OrganizationEventApi()
            // Get next level based on current state (resume from where we are, or start fresh)
            const level = await getNextFilterLevel(stateToLoad, organizationId, eventApi, queryParams)
            setCurrentFilterLevel(level)
            setIsLoadingLevel(false)
          }
        }}
        menus={isHierarchicalFilter ? [] : menus}
        width={dataHead.menuWidth || 280}
        isFilter
        trigger={
          <div className="flex">
            {hasFilter ? (
              <Button type="button" size="xs" className="whitespace-nowrap pr-6">
                {title} {!hideFilterNumber ? `(${dataFilterNumber})` : ''}
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
      >
        {isHierarchicalFilter ? (
          currentFilterLevel ? (
            <HierarchicalMenuGroup
              currentLevel={currentFilterLevel}
              isLoading={isLoadingLevel}
              onSelectItem={handleHierarchicalItemSelect}
              onBack={handleBack}
              canGoBack={navigationHistory.length > 0}
              currentValue={currentFilter === ALL ? 'ALL' : currentFilter}
              paddingMenuY={8}
              paddingMenuX={8}
            />
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="aspect-square w-6 animate-spin rounded-full border-2 border-solid border-b-transparent border-l-transparent border-r-brand-500 border-t-transparent" />
                <p className="text-sm text-neutral-350">Loading...</p>
              </div>
            </div>
          )
        ) : null}
      </Menu>
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

export default TableHeadFilter
