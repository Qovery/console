import { Dispatch, MouseEvent, SetStateAction, useState } from 'react'
import { upperCaseFirstLetter } from '@qovery/shared/utils'
import Button, { ButtonSize, ButtonStyle } from '../../buttons/button/button'
import Icon from '../../icon/icon'
import Menu from '../../menu/menu'
import { MenuItemProps } from '../../menu/menu-item/menu-item'
import { TableHeadProps } from '../table'

export interface TableHeadFilterProps {
  title: string
  dataHead: TableHeadProps[]
  currentFilter: string
  setCurrentFilter: Dispatch<SetStateAction<string>>
  defaultData: any[]
  setFilterData: Dispatch<SetStateAction<any[]>>
}

// create multiple filter
// need to output the function for testing
export function createFilter(
  dataHead: TableHeadProps[],
  defaultData: any[] | undefined,
  defaultValue = 'ALL',
  currentFilter: string,
  setCurrentFilter: Function,
  setLocalFilter: Function,
  setDataFilterNumber: Function,
  setFilterData: Function
) {
  const keys: string[] = []
  const menus = []
  // get array of keys
  for (let i = 0; i < dataHead.length; i++) {
    const data = dataHead[i]
    data.filter && data.filter.filter((currentData) => keys.push(currentData.key))
  }

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
        setLocalFilter,
        setDataFilterNumber,
        setFilterData
      )

    if (menu)
      menus.push({
        title: (dataHead[0].filter && dataHead[0].filter[i].title) || undefined,
        search: (dataHead[0].filter && dataHead[0].filter[i].search) || false,
        items: menu,
      })
  }

  return menus
}

// group by same value
export function groupBy(
  data: Array<any>,
  property: string,
  defaultValue = 'ALL',
  currentFilter: string,
  setCurrentFilter: Function,
  setLocalFilter: Function,
  setDataFilterNumber: Function,
  setFilterData: Function
) {
  const dataByKeys = data.reduce((acc, obj) => {
    // create global key for all objects
    if (!acc[defaultValue]) {
      acc[defaultValue] = []
    }

    // detect children of children "obj.obj"
    if (property.includes('.')) {
      const splitProperty = property.split('.')
      const key = obj[splitProperty[0]] && obj[splitProperty[0]][splitProperty[1]]

      if (!acc[key]) {
        acc[key] = []
      }

      acc[defaultValue].push(obj)
      acc[key].push(obj)
    } else {
      const key = obj[property]

      if (!acc[key]) {
        acc[key] = []
      }
      acc[defaultValue].push(obj)
      acc[key].push(obj)
    }

    return acc
  }, {})

  // create menus by keys
  const result: MenuItemProps[] = Object.keys(dataByKeys).map((key: string) => ({
    name: upperCaseFirstLetter(key.toLowerCase())?.replace('_', ' ') || '',
    truncateLimit: 20,
    contentLeft: (
      <Icon
        name="icon-solid-check"
        className={`text-sm ${currentFilter === key ? 'text-success-400' : 'text-transparent'}`}
      />
    ),
    contentRight: (
      <span className="px-1 bg-element-light-lighter-400 text-text-400 text-xs font-bold rounded-sm">
        {dataByKeys[key].length}
      </span>
    ),
    onClick: () => {
      const currentFilterData = [...dataByKeys[key]]

      if (currentFilter !== key) {
        // set filter when is different of current filter
        setCurrentFilter(key)
        setLocalFilter(key)
        setDataFilterNumber(currentFilterData.length)
        setFilterData && setFilterData(currentFilterData)
      } else {
        // reset by default filter
        setCurrentFilter(defaultValue)
        setLocalFilter('')
        setDataFilterNumber(0)
        setFilterData && setFilterData(data)
      }
    },
  }))

  return result as MenuItemProps[]
}

export function TableHeadFilter(props: TableHeadFilterProps) {
  const { title, dataHead, defaultData, setFilterData, currentFilter, setCurrentFilter } = props

  const ALL = 'ALL'

  const [localFilter, setLocalFilter] = useState('')
  const [dataFilterNumber, setDataFilterNumber] = useState(0)

  function cleanFilter(event: MouseEvent) {
    event.preventDefault()
    setCurrentFilter(ALL)
    setDataFilterNumber(0)
    // set global data by default
    defaultData && setFilterData && setFilterData(defaultData)
  }

  return (
    <div className="flex" key={Math.random()}>
      <Menu
        key={Math.random()}
        menus={createFilter(
          dataHead,
          defaultData,
          ALL,
          currentFilter,
          setCurrentFilter,
          setLocalFilter,
          setDataFilterNumber,
          setFilterData
        )}
        width={280}
        isFilter
        trigger={
          <div>
            {localFilter === currentFilter && localFilter !== ALL ? (
              <Button
                className="whitespace-nowrap inline-block btn--active"
                size={ButtonSize.TINY}
                style={ButtonStyle.TAB}
              >
                {title} ({dataFilterNumber})
              </Button>
            ) : (
              <Button
                className="inline-block"
                size={ButtonSize.TINY}
                style={ButtonStyle.TAB}
                iconRight="icon-solid-angle-down"
              >
                {title}
              </Button>
            )}
          </div>
        }
      />
      {localFilter === currentFilter && localFilter !== ALL && (
        <div className="btn btn--tiny btn--tab btn--active relative left-[-9px]">
          <span onClick={(event) => cleanFilter(event)}>
            <Icon name="icon-solid-circle-xmark" />
          </span>
        </div>
      )}
    </div>
  )
}

export default TableHeadFilter
