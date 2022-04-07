import { MenuDivider } from '@szhsin/react-menu'
import MenuItem, { MenuItemProps } from '../menu-item/menu-item'

export interface MenuGroupProps {
  menu: MenuItemProps[]
  isLast: boolean
}

export function MenuGroup(props: MenuGroupProps) {
  const { menu, isLast = true } = props

  return (
    <>
      {menu.map((item, index) => (
        <MenuItem key={index} name={item.name} link={item.link} />
      ))}
      {isLast && <MenuDivider />}
    </>
  )
}

export default MenuGroup
