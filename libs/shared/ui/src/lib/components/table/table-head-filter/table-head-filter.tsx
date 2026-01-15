import { type Dispatch, type MouseEvent, type SetStateAction, useEffect, useState } from 'react'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { Button } from '../../button/button'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'
import Menu from '../../menu/menu'
import { type MenuItemProps } from '../../menu/menu-item/menu-item'
import { type TableFilterProps, type TableHeadCustomFilterProps, type TableHeadProps } from '../table'

export interface TableHeadFilterProps<T> {
  title: string
  dataHead: TableHeadProps<T>
  defaultData: T[]
  setFilter: Dispatch<SetStateAction<TableFilterProps[]>>
  filter: TableFilterProps[]
  classNameTitle?: string
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
  setFilter: Dispatch<SetStateAction<TableFilterProps[]>>,
  hideFilterNumber?: boolean
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
        dataHead?.filter?.[i],
        hideFilterNumber
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
  dataHeadFilter?: TableHeadCustomFilterProps<T>,
  hideFilterNumber?: boolean
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
      contentRight: !hideFilterNumber && (
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
}: TableHeadFilterProps<T>) {
  const [currentFilter, setCurrentFilter] = useState(ALL)

  const hasFilter = filter?.some((item) => item.key === dataHead.filter?.[0].key && item.value !== ALL)

  const [dataFilterNumber, setDataFilterNumber] = useState(hasFilter ? defaultData.length : 0)
  const [isOpen, setOpen] = useState(false)

  const key = dataHead.filter?.[0].key || ''
  useEffect(() => {
    const filterFound = filter.find((item) => item.key === key)
    if (filterFound && filterFound.value === ALL) {
      setCurrentFilter(ALL)
    } else {
      filter.find((item) => item.key === key && item.value !== ALL && setCurrentFilter(item.value || ALL))
    }
  }, [filter])

  function cleanFilter(event: MouseEvent) {
    event.preventDefault()
    setCurrentFilter(ALL)
    setDataFilterNumber(0)
    // set global data by default
    setFilter &&
      setFilter((prev) => {
        const result = prev.filter((currentValue) => currentValue.key !== key)
        return [...result, { key: key, value: ALL }]
      })
  }

  const hideFilterNumber: boolean = dataHead.filter?.some((item) => item.hideFilterNumber) || false
  const menus = createFilter(
    dataHead,
    defaultData,
    ALL,
    currentFilter,
    setCurrentFilter,
    setDataFilterNumber,
    setFilter,
    hideFilterNumber
  )

  const isDark = document.documentElement.classList.contains('dark')

  return (
    <div className={`flex items-center ${classNameTitle ?? ''}`}>
      <Menu
        open={isOpen}
        onOpen={setOpen}
        menus={menus}
        width={dataHead.menuWidth || 280}
        isFilter
        trigger={
          <div className="relative flex">
            {hasFilter ? (
              <Button type="button" size="xs" className="whitespace-nowrap">
                {title} {!hideFilterNumber ? `(${dataFilterNumber})` : ''}
                <span role="button" className="left-6 flex" onClick={(event) => cleanFilter(event)}>
                  <Icon iconName="xmark" className="pl-2" />
                </span>
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
    </div>
  )
}

export default TableHeadFilter
