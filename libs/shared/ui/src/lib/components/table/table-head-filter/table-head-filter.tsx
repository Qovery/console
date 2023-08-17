import { Dispatch, MouseEvent, SetStateAction, useEffect, useState } from 'react'
import { upperCaseFirstLetter } from '@qovery/shared/utils'
import Button, { ButtonSize, ButtonStyle } from '../../buttons/button/button'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'
import Menu from '../../menu/menu'
import { MenuItemProps } from '../../menu/menu-item/menu-item'
import { TableFilterProps, TableHeadCustomFilterProps, TableHeadProps } from '../table'

export interface TableHeadFilterProps<T> {
  title: string
  dataHead: TableHeadProps<T>
  defaultData: T[]
  setFilter: Dispatch<SetStateAction<TableFilterProps[]>>
  filter: TableFilterProps[]
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
      name: upperCaseFirstLetter(item.toLowerCase())?.replace('_', ' ') || '',
      truncateLimit: 20,
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
    const dataByKeys: Record<string, T[]> = data.reduce((acc, obj) => {
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
    }, {} as Record<string, T[]>)

    if (dataHeadFilter?.itemContentCustom) {
      delete dataByKeys[defaultValue]
    }

    // create menus by keys
    const result: MenuItemProps[] = Object.keys(dataByKeys).map((key: string) => ({
      name: upperCaseFirstLetter(key.toLowerCase())?.replace('_', ' ') || '',
      truncateLimit: 20,
      contentLeft: (
        <Icon
          name={IconAwesomeEnum.CHECK}
          className={`text-sm ${currentFilter === key ? 'text-green-400' : 'text-transparent'}`}
        />
      ),
      contentRight: (
        <span className="px-1 bg-element-light-lighter-400 text-text-400 text-xs font-bold rounded-sm">
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
          setFilter && setFilter((prev) => prev.filter((currentValue) => currentValue.key !== property))
        }
      },
    }))

    return result as MenuItemProps[]
  }
}

export function TableHeadFilter<T>({ title, dataHead, defaultData, filter, setFilter }: TableHeadFilterProps<T>) {
  const [currentFilter, setCurrentFilter] = useState(ALL)
  const [dataFilterNumber, setDataFilterNumber] = useState(0)
  const [isOpen, setOpen] = useState(false)

  const key = dataHead.filter?.[0].key || ''
  useEffect(() => {
    filter.find((item) => item.key === key && item.value !== ALL && setCurrentFilter(item.value || ALL))
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
  const hasFilter = filter?.some((item) => item.key === dataHead.filter?.[0].key && item.value !== ALL)
  const isDark = document.documentElement.classList.contains('dark')

  return (
    <div className="flex items-center">
      <Menu
        open={isOpen}
        onOpen={setOpen}
        menus={menus}
        width={dataHead.menuWidth || 280}
        isFilter
        trigger={
          <div className="flex">
            {hasFilter ? (
              <Button className="whitespace-nowrap flex btn--active !h-6 !pr-[26px]" size={ButtonSize.TINY}>
                {title} {!hideFilterNumber ? `(${dataFilterNumber})` : ''}
              </Button>
            ) : (
              <Button
                className={`flex !h-6 ${isDark ? 'btn--dark' : ''}`}
                size={ButtonSize.TINY}
                style={ButtonStyle.STROKED}
                iconRight={IconAwesomeEnum.ANGLE_DOWN}
              >
                {title}
              </Button>
            )}
          </div>
        }
      />
      {hasFilter && (
        <span
          role="button"
          className="flex items-center h-6 px-2 relative -left-6 text-text-100 text-xs cursor-pointer"
          onClick={(event) => cleanFilter(event)}
        >
          <Icon name={IconAwesomeEnum.XMARK} />
        </span>
      )}
    </div>
  )
}

export default TableHeadFilter
