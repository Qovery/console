import { MenuItem as Item } from '@szhsin/react-menu'

export interface MenuItemProps {
  name: string
  link: string
}

export function MenuItem(props: MenuItemProps) {
  const { name, link } = props

  return <Item href={link}>{name}</Item>
}

export default MenuItem
