import { Menu, MenuDivider } from '@szhsin/react-menu'
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
  size?: MenuSize
}

export function MenuGroup(props: MenuGroupProps) {
  const { menu = { items: [] }, isLast = true, size = MenuSize.NORMAL } = props

  const [filter, setFilter] = useState('')
  const [empty, setEmpty] = useState(false)

  const filterData = (value: string) => {
    setFilter(value)
    const items = menu.items.filter((item) => item.name.includes(value))
    items.length === 0 ? setEmpty(true) : setEmpty(false)
  }

  return (
    <>
      {menu?.title && (
        <div className={`flex justify-between items-center pt-3 ${size === MenuSize.BIG ? 'pt-4 px-5' : 'pt-3 px-3'}`}>
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
        <div className={`menu__search ${size === MenuSize.BIG ? 'py-3 px-5' : 'pt-3 px-3'}`}>
          <InputSearch placeholder="Search" onChange={(value) => filterData(value)} isEmpty={empty} />
        </div>
      )}
      {!empty && (
        <div className={size === MenuSize.BIG ? 'py-3 px-5' : 'p-3'}>
          {menu.items
            .filter((item) => item.name.toUpperCase().includes(filter.trim().toUpperCase()))
            .map((item, index) => (
              <MenuItem
                key={index}
                name={item.name}
                link={item.link}
                contentLeft={item?.contentLeft}
                contentRight={item?.contentRight}
              />
            ))}
        </div>
      )}
      {!isLast && <MenuDivider className="bg-element-light-lighter-400 m-0" />}
    </>
  )
}

export default MenuGroup
