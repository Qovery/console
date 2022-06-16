import { Truncate } from '@console/shared/ui'
import { ClickEvent, MenuItem as Item } from '@szhsin/react-menu'
import React from 'react'
import { useNavigate } from 'react-router-dom'
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
  className?: string
  textClassName?: string
  isActive?: boolean
  truncateLimit?: number
}

export function MenuItem(props: MenuItemProps) {
  const {
    name,
    link,
    contentLeft,
    contentRight,
    onClick,
    copy,
    copyTooltip,
    isActive = false,
    textClassName = 'text-text-500',
    className = '',
    truncateLimit = 34,
  } = props
  const navigate = useNavigate()

  const copyName = (e: React.MouseEvent) => {
    e.preventDefault()
    copy && navigator.clipboard.writeText(copy)
  }

  const itemContent = (
    <>
      <div className={`flex items-center truncate ${className}`}>
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
        <span className={`menu-item__name text-sm font-medium ${textClassName}`}>
          <Truncate text={name} truncateLimit={truncateLimit} />
        </span>
      </div>
      <div className="flex items-center">{contentRight && <span className="ml-3">{contentRight}</span>}</div>
    </>
  )

  if (link?.external) {
    return (
      <Item
        className={`menu-item ${isActive ? 'menu-item--hover' : ''}`}
        href={link.url}
        data-testid="menuItem"
        target="_blank"
        onClick={onClick}
      >
        {itemContent}
      </Item>
    )
  } else {
    return (
      <Item
        className={`menu-item ${isActive ? 'menu-item--hover' : ''}`}
        data-testid="menuItem"
        defaultValue="prod"
        onClick={(e: ClickEvent) => {
          e.syntheticEvent.preventDefault()
          link?.url && navigate(link?.url)
          onClick && onClick(e)
        }}
      >
        {itemContent}
      </Item>
    )
  }
}

export default MenuItem
