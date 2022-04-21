import { MenuItem as Item } from '@szhsin/react-menu'
import { Link, useNavigate } from 'react-router-dom'
export interface MenuItemProps {
  name: string
  link: { url: string; external?: boolean }
  contentLeft?: React.ReactNode
  contentRight?: React.ReactNode
}

export function MenuItem(props: MenuItemProps) {
  const { name, link, contentLeft, contentRight } = props
  const navigate = useNavigate()

  const itemContent = (
    <>
      <div>
        {contentLeft && <span className="mr-3">{contentLeft}</span>}
        <span className="text-sm text-text-500 font-medium">{name}</span>
      </div>
      <div>{contentRight && <span className="ml-3">{contentRight}</span>}</div>
    </>
  )

  if (link.external) {
    return (
      <Item
        className="w-full h-8 rounded-sm flex justify-between px-3 py-0 hover:bg-element-light-lighter-300 mb-1"
        href={link.url}
        data-testid="menuItem"
        target="_blank"
      >
        {itemContent}
      </Item>
    )
  } else {
    return (
      <Link to={link.url}>
        <Item
          className="w-full h-8 rounded-sm flex justify-between px-3 py-0 hover:bg-element-light-lighter-300 mb-1"
          data-testid="menuItem"
          onClick={() => navigate(link.url)}
        >
          {itemContent}
        </Item>
      </Link>
    )
  }
}

export default MenuItem
