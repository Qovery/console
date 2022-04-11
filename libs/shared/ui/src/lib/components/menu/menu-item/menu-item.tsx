import { MenuItem as Item } from '@szhsin/react-menu'
import Icon from '../../icon/icon'

export interface MenuItemProps {
  name: string
  link: string
  contentLeft?: React.ReactNode
  contentRight?: React.ReactNode
}

export function MenuItem(props: MenuItemProps) {
  const { name, link, contentLeft, contentRight } = props

  return (
    <Item
      className="w-full h-8 rounded-sm flex justify-between px-3 py-0 hover:bg-element-light-lighter-300"
      href={link}
      data-testid="menuItem"
    >
      <div>
        {contentLeft && <span className="mr-2">{contentLeft}</span>}
        <span className="text-sm text-text-500 font-medium">{name}</span>
      </div>
      <div>{contentRight && <span className="ml-2">{contentRight}</span>}</div>
    </Item>
  )
}

export default MenuItem
