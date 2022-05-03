import { MenuDivider } from '@szhsin/react-menu'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import InputSearch from '../../inputs/input-search/input-search'
import { MenuItem, MenuItemProps } from '../menu-item/menu-item'

export interface MenuGroupProps {
  menu: {
    items: MenuItemProps[]
    title?: string
    button?: string
    buttonLink?: string
    search?: boolean
  }
  isLast: boolean
  paddingMenuY?: number
  paddingMenuX?: number
  style?: object
  isFilter?: boolean
}

export function MenuGroup(props: MenuGroupProps) {
  const { menu = { items: [] }, isLast = true, paddingMenuX = 12, paddingMenuY = 12, style = {}, isFilter } = props

  const [currentItems, setCurrentItems] = useState(menu.items)

  useEffect(() => {
    setCurrentItems(menu.items)
  }, [menu.items])

  const filterData = (value: string) => {
    value = value.toUpperCase()
    const items = menu.items.filter((item) => item.name.toUpperCase().includes(value))
    setCurrentItems(items)
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
        <div className="flex justify-between items-center" style={headPaddingStyle}>
          {menu?.title && (
            <p data-testid="title" className="text-sm text-text-300">
              {menu?.title}
            </p>
          )}
          {menu?.button && menu?.buttonLink ? (
            <Link className="text-sm text-brand-400" to={menu?.buttonLink}>
              {menu?.button}
            </Link>
          ) : (
            ''
          )}
        </div>
      )}
      {menu?.search && (
        <div className="menu__search" style={headPaddingStyle}>
          <InputSearch
            autofocus
            placeholder="Search"
            onChange={(value: string) => filterData(value)}
            isEmpty={currentItems.length === 0}
          />
        </div>
      )}
      {isFilter && menu?.title && currentItems.length !== 0 && (
        <p className="text-sm text-text-400 ml-2" style={headPaddingStyle}>
          {menu?.title}
        </p>
      )}
      {currentItems.length > 0 && (
        <div style={paddingStyle}>
          {currentItems.map((item, index) => (
            <MenuItem
              key={index}
              name={item.name}
              link={item.link}
              contentLeft={item?.contentLeft}
              contentRight={item?.contentRight}
              onClick={item.onClick}
            />
          ))}
        </div>
      )}
      {!isFilter && !isLast && <MenuDivider className="bg-element-light-lighter-400 m-0" />}
    </div>
  )
}

export default MenuGroup
