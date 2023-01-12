import { Dispatch, MouseEvent, SetStateAction, useState } from 'react'
import { upperCaseFirstLetter } from '@qovery/shared/utils'
import Button, { ButtonSize, ButtonStyle } from '../../buttons/button/button'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'
import Menu from '../../menu/menu'
import { MenuItemProps } from '../../menu/menu-item/menu-item'
import { TableFilterProps, TableHeadCustomFilterProps, TableHeadProps } from '../table'

export interface TableHeadFilterProps {
  title: string
  dataHead: TableHeadProps
  currentFilter: string
  setCurrentFilter: Dispatch<SetStateAction<string>>
  defaultData: any[]
  setFilter: Dispatch<SetStateAction<TableFilterProps>>
}

// create multiple filter
// need to output the function for testing
export function createFilter(
  dataHead: TableHeadProps,
  defaultData: any[] | undefined,
  defaultValue = 'ALL',
  currentFilter: string,
  setCurrentFilter: any,
  setLocalFilter: any,
  setDataFilterNumber: any,
  setFilter: any
) {
  const keys: string[] = []
  const menus = []
  // get array of keys
  dataHead.filter && dataHead.filter.filter((currentData) => keys.push(currentData.key))

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
        setFilter,
        dataHead.filter && dataHead.filter[i]
      )

    if (menu)
      menus.push({
        title: (dataHead.filter && dataHead.filter[i].title) || undefined,
        search: (dataHead.filter && dataHead.filter[i].search) || false,
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
  setCurrentFilter: any,
  setLocalFilter: any,
  setDataFilterNumber: any,
  setFilter: any,
  dataHeadFilter?: TableHeadCustomFilterProps
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
        className={`text-sm ${currentFilter === key ? 'text-success-400' : 'text-transparent'}`}
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
        setLocalFilter(key)
        setDataFilterNumber(currentFilterData.length)
        setFilter &&
          setFilter({
            key: property,
            value: key,
          })
      } else {
        // reset by default filter
        setCurrentFilter(defaultValue)
        setLocalFilter('')
        setDataFilterNumber(0)
        setFilter && setFilter({})
      }
    },
  }))

  return result as MenuItemProps[]
}

export function TableHeadFilter(props: TableHeadFilterProps) {
  const { title, dataHead, defaultData, setFilter, currentFilter, setCurrentFilter } = props

  const ALL = 'ALL'

  const [localFilter, setLocalFilter] = useState('')
  const [dataFilterNumber, setDataFilterNumber] = useState(0)
  const [isOpen, setOpen] = useState(false)

  function cleanFilter(event?: MouseEvent) {
    event?.preventDefault()
    setCurrentFilter(ALL)
    setDataFilterNumber(0)
    // set global data by default
    defaultData && setFilter && setFilter({})
  }

  const menus = createFilter(
    dataHead,
    defaultData,
    ALL,
    currentFilter,
    setCurrentFilter,
    setLocalFilter,
    setDataFilterNumber,
    setFilter
  )

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
            {localFilter === currentFilter && localFilter !== ALL ? (
              <Button
                className="whitespace-nowrap flex btn--active !h-6"
                size={ButtonSize.TINY}
                style={ButtonStyle.TAB}
              >
                {title} ({dataFilterNumber})
              </Button>
            ) : (
              <Button
                className="flex !h-6"
                size={ButtonSize.TINY}
                style={ButtonStyle.TAB}
                iconRight={IconAwesomeEnum.ANGLE_DOWN}
              >
                {title}
              </Button>
            )}
          </div>
        }
      />
      {localFilter === currentFilter && localFilter !== ALL && (
        <div className="btn btn--tiny btn--tab btn--active !h-6 relative left-[-9px]">
          <span onClick={(event) => cleanFilter(event)}>
            <Icon name={IconAwesomeEnum.CIRCLE_XMARK} />
          </span>
        </div>
      )}
    </div>
  )
}

export default TableHeadFilter
