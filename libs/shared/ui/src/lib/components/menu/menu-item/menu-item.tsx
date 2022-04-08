import { MenuItem as Item } from '@szhsin/react-menu'
import Icon from '../../icon/icon'

export interface MenuItemProps {
  name: string
  link: string
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
}

export function MenuItem(props: MenuItemProps) {
  const { name, link, iconLeft, iconRight } = props

  return (
    <Item
      className="w-full h-8 rounded-sm flex justify-between px-3 py-0 hover:bg-element-light-lighter-300"
      href={link}
      data-testid="menuItem"
    >
      <div>
        {iconLeft && <span className="mr-2">{iconLeft}</span>}
        <span className="text-sm text-text-500 font-medium">{name}</span>
      </div>
      <div>{iconRight && <span className="ml-2">{iconRight}</span>}</div>
    </Item>
  )
}

export default MenuItem
