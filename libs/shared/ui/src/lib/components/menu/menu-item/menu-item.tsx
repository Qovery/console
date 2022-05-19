import { ClickEvent, MenuItem as Item } from '@szhsin/react-menu'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ButtonIcon, { ButtonIconStyle } from '../../buttons/button-icon/button-icon'
import Tooltip from '../../tooltip/tooltip'
export interface MenuItemProps {
  name: string
  link?: { url: string; external?: boolean }
  contentLeft?: React.ReactNode
  contentRight?: React.ReactNode
  onClick?: (e: ClickEvent) => void
  copy?: string
  copyTooltip?: string
}

export function MenuItem(props: MenuItemProps) {
  const { name, link, contentLeft, contentRight, onClick, copy, copyTooltip } = props
  const navigate = useNavigate()

  const copyName = (e: React.MouseEvent) => {
    e.preventDefault()
    copy && navigator.clipboard.writeText(copy)
  }

  const itemContent = (
    <>
      <div className="flex items-center">
        {copy && (
          <Tooltip content={copyTooltip ? copyTooltip : 'Copy'}>
            <div>
              <ButtonIcon
                icon="icon-solid-copy"
                style={ButtonIconStyle.FLAT}
                iconClassName="!text-base text-text-400"
                className="!w-auto mr-3"
                onClick={(e) => copyName(e)}
              />
            </div>
          </Tooltip>
        )}

        {contentLeft && <span className="mr-3">{contentLeft}</span>}
        <span className="text-sm text-text-500 font-medium">{name}</span>
      </div>
      <div>{contentRight && <span className="ml-3">{contentRight}</span>}</div>
    </>
  )

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
