import { MenuItem as Item } from '@szhsin/react-menu'
export interface MenuItemProps {
  name: string
  link: string
  contentLeft?: React.ReactNode
  contentRight?: React.ReactNode
  external?: boolean
}

export function MenuItem(props: MenuItemProps) {
  const { name, link, contentLeft, contentRight, external = false } = props

  return (
    <Item
      className="w-full h-8 rounded-sm flex justify-between px-3 py-0 hover:bg-element-light-lighter-300 mb-1"
      href={link}
      data-testid="menuItem"
      target={external ? '_blank' : '_self'}
    >
      <div>
        {contentLeft && <span className="mr-3">{contentLeft}</span>}
        <span className="text-sm text-text-500 font-medium">{name}</span>
      </div>
      <div>{contentRight && <span className="ml-3">{contentRight}</span>}</div>
    </Item>
  )
}

export default MenuItem
