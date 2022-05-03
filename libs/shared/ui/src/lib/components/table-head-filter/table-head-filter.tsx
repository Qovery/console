import { Dispatch, MouseEvent, SetStateAction, useState } from 'react'
import { Button, ButtonSize, ButtonStyle, Icon, Menu } from '@console/shared/ui'
import { upperCaseFirstLetter } from '@console/shared/utils'
import { MenuItemProps } from '../menu/menu-item/menu-item'

export interface TableHeadFilterProps {
  title: string
  dataHead: {
    title: string
    className?: string
    filter?: {
      key: string
      search?: boolean
      title?: string
    }[]
  }[]
  defaultData?: any[]
  setFilterData?: Dispatch<SetStateAction<any[]>>
}

export function TableHeadFilter(props: TableHeadFilterProps) {
  const { title, dataHead, defaultData, setFilterData } = props

  const ALL = 'ALL'

  const [currentFilter, setCurrentFilter] = useState(ALL)
  const [dataDataFilterNumber, setDataDataFilterNumber] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  function groupBy(data: Array<any>, property: string) {
    const dataByKeys = data.reduce((acc, obj) => {
      if (!acc[ALL]) {
        acc[ALL] = []
      }

      // detect children of children "obj.obj"
      if (property.includes('.')) {
        const splitProperty = property.split('.')
        const key = obj[splitProperty[0]] && obj[splitProperty[0]][splitProperty[1]]

        if (!acc[key]) {
          acc[key] = []
        }

        acc[ALL].push(obj)
        acc[key].push(obj)
      } else {
        const key = obj[property]

        if (!acc[key]) {
          acc[key] = []
        }
        acc[ALL].push(obj)
        acc[key].push(obj)
      }

      return acc
    }, {})

    const result: MenuItemProps[] = Object.keys(dataByKeys).map((key: string) => ({
      name: upperCaseFirstLetter(key.toLowerCase())?.replace('_', ' ') || '',
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
        const currentFilterData = dataByKeys[key]
        if (currentFilter !== key) {
          setCurrentFilter(key)
          setDataDataFilterNumber(currentFilterData.length)
          setFilterData && setFilterData(currentFilterData)
        } else {
          // reset by default filter
          setCurrentFilter(ALL)
          setDataDataFilterNumber(0)
          setFilterData && setFilterData(data)
        }
      },
    }))

    return result as MenuItemProps[]
  }

  function createFilter() {
    const keys: string[] = []
    const menus = []
    // get array of keys
    for (let i = 0; i < dataHead.length; i++) {
      const data = dataHead[i]
      data.filter && data.filter.filter((currentData) => keys.push(currentData.key))
    }

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const menu: MenuItemProps[] | undefined = defaultData && groupBy(defaultData, key)

      if (menu)
        menus.push({
          title: (dataHead[0].filter && dataHead[0].filter[i].title) || undefined,
          search: (dataHead[0].filter && dataHead[0].filter[i].search) || false,
          items: menu,
        })
    }

    return menus
  }

  function cleanFilter(event: MouseEvent) {
    event.preventDefault()
    setMenuOpen(false)
    setCurrentFilter(ALL)
    setDataDataFilterNumber(0)
    defaultData && setFilterData && setFilterData(defaultData)
  }

  return (
    <Menu
      menus={createFilter()}
      open={menuOpen}
      onOpen={() => setMenuOpen(true)}
      width={280}
      isFilter
      trigger={
        <div>
          {currentFilter !== ALL ? (
            <Button className="inline-block" size={ButtonSize.VERY_SMALL} style={ButtonStyle.BASIC}>
              {title} ({dataDataFilterNumber})
              <span onClick={(event) => cleanFilter(event)}>
                <Icon className="ml-1.5" name="icon-solid-circle-xmark" />
              </span>
            </Button>
          ) : (
            <Button
              className="inline-block"
              size={ButtonSize.VERY_SMALL}
              style={ButtonStyle.STROKED}
              iconRight="icon-solid-angle-down"
            >
              {title}
            </Button>
          )}
        </div>
      }
    />
  )
}

export default TableHeadFilter
