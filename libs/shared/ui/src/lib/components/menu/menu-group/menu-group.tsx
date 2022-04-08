import { MenuDivider } from '@szhsin/react-menu'
import { Link } from 'react-router-dom'
import MenuItem, { MenuItemProps } from '../menu-item/menu-item'

export interface MenuGroupProps {
  menu: { items: MenuItemProps[]; title?: string; button?: string; buttonLink?: string }
  isLast: boolean
}

export function MenuGroup(props: MenuGroupProps) {
  const { menu = { items: [] }, isLast = true } = props

  return (
    <>
      {menu?.title && (
        <div className="flex justify-between items-center pt-3 pr-3 pl-3">
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
      <div className="p-3">
        {menu.items.map((item, index) => (
          <MenuItem
            key={index}
            name={item.name}
            link={item.link}
            iconLeft={item?.iconLeft}
            iconRight={item?.iconRight}
          />
        ))}
      </div>
      {!isLast && <MenuDivider className="bg-element-light-lighter-400 m-0" />}
    </>
  )
}

export default MenuGroup
