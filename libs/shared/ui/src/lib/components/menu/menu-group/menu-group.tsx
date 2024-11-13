import { MenuDivider } from '@szhsin/react-menu'
import { type ReactNode, useEffect, useState } from 'react'
import { sortByKey } from '@qovery/shared/util-js'
import InputSearch from '../../inputs/input-search/input-search'
import { MenuItem, type MenuItemProps } from '../menu-item/menu-item'

export interface MenuGroupProps {
  menu: {
    items: MenuItemProps[]
    label?: string
    title?: string
    sortAlphabetically?: boolean
    button?: {
      label?: string | ReactNode
      onClick?: () => void
    }
    search?: boolean
  }
  isLast: boolean
  paddingMenuY?: number
  paddingMenuX?: number
  style?: object
  isFilter?: boolean
  dontOrderAlphabetically?: boolean
}

export function MenuGroup(props: MenuGroupProps) {
  const { menu = { items: [] }, isLast = true, paddingMenuX = 8, paddingMenuY = 8, style = {}, isFilter } = props

  const [currentItems, setCurrentItems] = useState(menu.items)
  const [filteredItems, setFilteredItems] = useState(menu.items)
  const [currentSearch, setCurrentSearch] = useState('')

  useEffect(() => {
    setCurrentItems(menu.items)
  }, [menu.items])

  useEffect(() => {
    const filtered = currentItems.filter((item) => {
      if (!item.name) return true
      return item.name?.toUpperCase().includes(currentSearch.toUpperCase())
    })

    setFilteredItems(menu.sortAlphabetically ? sortByKey(filtered, 'name') : filtered)
  }, [currentSearch, currentItems])

  const filterData = (value: string) => {
    setCurrentSearch(value)
  }

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
    <div style={style}>
      {!isFilter && menu?.title && (
        <div className="flex items-center justify-between" style={headPaddingStyle}>
          {menu?.title && (
            <p data-testid="title" className="text-sm font-medium text-neutral-350 dark:text-neutral-250">
              {menu?.title}
            </p>
          )}
          {menu?.button && (
            <span
              className="link inline-block cursor-pointer text-sm font-medium text-brand-500 dark:hover:text-brand-500"
              onClick={menu?.button.onClick}
            >
              {menu?.button.label}
            </span>
          )}
        </div>
      )}
      {menu?.search && (
        <div className="menu__search" style={headPaddingStyle} data-testid="menu-search">
          <InputSearch
            autofocus
            className="dark:bg-neutral-600"
            placeholder="Search"
            isEmpty={filteredItems.length === 0}
            onChange={(value: string) => {
              filterData(value)
            }}
          />
        </div>
      )}
      {isFilter && menu?.title && filteredItems.length !== 0 && (
        <p className="ml-2 text-sm text-neutral-350" style={headPaddingStyle}>
          {menu?.title}
        </p>
      )}
      {filteredItems.length > 0 && (
        <div style={paddingStyle} className="max-h-80 overflow-y-auto">
          {filteredItems.map((item, index) => {
            // if object empty not return item
            if (Object.keys(item).length === 0) {
              return null
            } else {
              return <MenuItem key={index} {...item} />
            }
          })}
        </div>
      )}
      {!isFilter && !isLast && filteredItems.length > 0 && (
        <MenuDivider className="m-0 mx-3 bg-neutral-200 dark:bg-neutral-600" />
      )}
    </div>
  )
}

export default MenuGroup
