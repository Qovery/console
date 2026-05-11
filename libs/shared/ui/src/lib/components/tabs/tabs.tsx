import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface TabsItem {
  name: string | ReactNode
  link?: string
  onClick?: () => void
  active?: boolean
  external?: boolean
  icon?: ReactNode
}

export interface TabsProps {
  items: TabsItem[]
  contentRight?: ReactNode
  className?: string
  classNameBtn?: string
  fullWidth?: boolean
}

/**
 * @deprecated This should be migrated to the tabs-primitives component
 */
export function Tabs(props: TabsProps) {
  const { items = [], contentRight, className = 'bg-background pl-4', classNameBtn = '', fullWidth } = props

  function content(item: TabsItem) {
    return typeof item.name === 'string' ? (
      <>
        {item.icon && item.icon}
        <p className="text-sm font-medium">{item.name}</p>
      </>
    ) : (
      item.name
    )
  }

  const btnClassName = `h-14 border-b-2 px-4 flex gap-3 items-center group transition ease-in-out duration-200 ${classNameBtn} hover:border-brand-strong hover:text-brand`

  const btnClassNameActive = (item: TabsItem) =>
    `${item?.active ? `text-brand border-brand-strong` : `text-neutral-subtle border-neutral`}`

  const contentTab = (item: TabsItem, index: number) => {
    if (item.onClick) {
      return (
        <span
          key={index}
          onClick={item.onClick}
          className={`flex cursor-pointer ${btnClassName} ${btnClassNameActive(item)}`}
        >
          {content(item)}
        </span>
      )
    } else if (!item.external && item.link) {
      return (
        <Link key={index} to={item.link} className={`${btnClassName} ${btnClassNameActive(item)}`}>
          {content(item)}
        </Link>
      )
    } else {
      return (
        <a
          key={index}
          href={item.link}
          target="_blank"
          rel="noreferrer"
          className={`${btnClassName} ${btnClassNameActive(item)}`}
        >
          {content(item)}
        </a>
      )
    }
  }

  return (
    <div className={`flex h-14 w-full shrink-0 items-center justify-between rounded-b ${className}`}>
      <div className={`flex h-14 gap-1 ${fullWidth ? 'flex-grow' : ''}`}>
        {items.map((item: TabsItem, index: number) => contentTab(item, index))}
      </div>
      {contentRight && <div className="flex items-center">{contentRight}</div>}
    </div>
  )
}

export default Tabs
