import { MenuDivider } from '@szhsin/react-menu'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import InputSearch from '../../inputs/input-search/input-search'
import { MenuSize } from '../menu'
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
}

export function MenuGroup(props: MenuGroupProps) {
  const { menu = { items: [] }, isLast = true, paddingMenuX = 12, paddingMenuY = 12, style = {} } = props

  const [filter, setFilter] = useState('')
  const [empty, setEmpty] = useState(false)

  const filterData = (value: string) => {
    setFilter(value)
    const items = menu.items.filter((item) => item.name.includes(value))
    items.length === 0 ? setEmpty(true) : setEmpty(false)
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
      {menu?.title && (
        <div className={`flex justify-between items-center`} style={headPaddingStyle}>
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
        <div className={`menu__search`} style={headPaddingStyle}>
          <InputSearch placeholder="Search" onChange={(value) => filterData(value)} isEmpty={empty} />
        </div>
      )}
      {!empty && (
        <div style={paddingStyle}>
          {menu.items
            .filter((item) => item.name.toUpperCase().includes(filter.trim().toUpperCase()))
            .map((item, index) => (
              <MenuItem
                key={index}
                name={item.name}
                link={item.link}
                contentLeft={item?.contentLeft}
                contentRight={item?.contentRight}
                external={item?.external}
              />
            ))}
        </div>
      )}
      {!isLast && <MenuDivider className="bg-element-light-lighter-400 m-0" />}
    </div>
  )
}

export default MenuGroup
