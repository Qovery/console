import { type ClickEvent, FocusableItem, MenuItem as Item } from '@szhsin/react-menu'
import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CopyToClipboardButtonIcon } from '../../copy-to-clipboard-button-icon/copy-to-clipboard-button-icon'
import { Tooltip } from '../../tooltip/tooltip'
import { Truncate } from '../../truncate/truncate'

export type MenuItemProps =
  | {
      name?: string
      contentLeft?: ReactNode
      contentRight?: ReactNode
      onClick?: (e: ClickEvent) => void
      copy?: string
      copyTooltip?: string
      containerClassName?: string
      className?: string
      textClassName?: string
      isActive?: boolean
      truncateLimit?: number
      disabled?: boolean
      itemContentCustom?: ReactNode
      tooltip?: string
    }
  | {
      name?: string
      link?: { url: string; external?: boolean }
      contentLeft?: ReactNode
      contentRight?: ReactNode
      copy?: string
      copyTooltip?: string
      containerClassName?: string
      className?: string
      textClassName?: string
      isActive?: boolean
      truncateLimit?: number
      disabled?: boolean
      itemContentCustom?: ReactNode
      tooltip?: string
    }

export function MenuItem(props: MenuItemProps) {
  const {
    name,
    contentLeft,
    contentRight,
    copy,
    copyTooltip,
    isActive = false,
    textClassName = 'text-neutral-400 dark:text-neutral-100',
    className = '',
    containerClassName = '',
    truncateLimit = 34,
    disabled = false,
    itemContentCustom,
    tooltip,
  } = props

  const disabledClassName = disabled ? 'opacity-50 cursor-not-allowed' : ''

  const itemContent = itemContentCustom ? (
    itemContentCustom
  ) : (
    <>
      <div className={`flex items-center truncate ${className}`}>
        {copy && (
          <div onClick={(e) => e.preventDefault()}>
            <CopyToClipboardButtonIcon
              content={copy}
              tooltipContent={copyTooltip}
              className="mr-4 text-neutral-400 dark:text-neutral-100"
            />
          </div>
        )}

        {contentLeft && (
          <span className="mr-3 flex items-center" data-testid="menu-icon">
            {contentLeft}
          </span>
        )}
        {name && (
          <span className={`menu-item__name text-sm font-medium ${textClassName}`}>
            <Truncate text={name} truncateLimit={truncateLimit} />
          </span>
        )}
      </div>
      <div className="flex items-center">{contentRight && <span className="ml-3">{contentRight}</span>}</div>
    </>
  )

  const item =
    'link' in props ? (
      props.link?.external ? (
        <Item
          className={`menu-item ${isActive ? 'menu-item--hover' : ''} ${containerClassName}`}
          href={props.link?.url}
          data-testid="menuItem"
          target="_blank"
          rel="noopener noreferrer"
        >
          {itemContent}
        </Item>
      ) : (
        <FocusableItem className={`menu-item ${isActive ? 'menu-item--hover' : ''} ${containerClassName}`}>
          {({ ref, closeMenu }) => (
            <Link
              ref={ref}
              to={props.link?.url ?? '/'}
              className="flex h-full w-full items-center"
              data-testid="menuItem"
              onClick={({ detail }) => closeMenu(detail === 0 ? 'Enter' : undefined)}
            >
              {itemContent}
            </Link>
          )}
        </FocusableItem>
      )
    ) : (
      <Item
        className={`menu-item ${isActive ? 'menu-item--hover' : ''} ${containerClassName} ${disabledClassName}`}
        data-testid="menuItem"
        defaultValue="prod"
        onClick={(e: ClickEvent) => {
          e.syntheticEvent.preventDefault()
          if (!disabled) {
            'onClick' in props && props.onClick?.(e)
          }
        }}
        disabled={disabled}
      >
        {itemContent}
      </Item>
    )

  const result = tooltip ? <Tooltip content={tooltip}>{item}</Tooltip> : item

  return result
}

export default MenuItem
