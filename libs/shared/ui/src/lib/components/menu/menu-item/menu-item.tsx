import { ClickEvent, MenuItem as Item } from '@szhsin/react-menu'
import { Link, useNavigate } from 'react-router-dom'
export interface MenuItemProps {
  name: string
  link?: { url: string; external?: boolean }
  contentLeft?: React.ReactNode
  contentRight?: React.ReactNode
  onClick?: (e: ClickEvent) => void
  customContent?: React.ReactNode
}

export function MenuItem(props: MenuItemProps) {
  const { name, link, contentLeft, contentRight, onClick, customContent } = props
  const navigate = useNavigate()

  const itemContent = (
    <>
      <div>
        {contentLeft && <span className="mr-3">{contentLeft}</span>}
        <span className="text-sm text-text-500 font-medium">{name || 'name undefined'}</span>
      </div>
      <div>{contentRight && <span className="ml-3">{contentRight}</span>}</div>
    </>
  )

  if (customContent) {
    return <div>{customContent}</div>
  }

  if (link?.external) {
    return (
      <Item className="menu-item" href={link.url} data-testid="menuItem" target="_blank" onClick={onClick}>
        {itemContent}
      </Item>
    )
  } else {
    return (
      <Link to={link?.url ? link?.url : ''}>
        <Item
          className="menu-item"
          data-testid="menuItem"
          onClick={(e) => {
            navigate(link?.url ? link?.url : '')
            onClick && onClick(e)
          }}
        >
          {itemContent}
        </Item>
      </Link>
    )
  }
}

export default MenuItem
