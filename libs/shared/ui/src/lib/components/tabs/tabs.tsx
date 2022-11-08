import React from 'react'
import { Link } from 'react-router-dom'

export interface TabsItem {
  name: string | React.ReactNode
  link?: string
  onClick?: () => void
  active?: boolean
  external?: boolean
  icon?: React.ReactNode
}

export interface TabsProps {
  items: TabsItem[]
  contentRight?: React.ReactNode
  className?: string
  classNameBtn?: string
  fullWidth?: boolean
}

export function Tabs(props: TabsProps) {
  const { items = [], contentRight, className = 'bg-white pl-4', classNameBtn = '', fullWidth } = props

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

  const btnClassName = `h-14 border-b-2 px-4 flex gap-3 items-center group transition ease-in-out duration-200 ${classNameBtn} dark:hover:border-text-100 dark:hover:text-text-100 hover:border-brand-500 hover:text-brand-500`

  const btnClassNameActive = (item: TabsItem) =>
    `${
      item?.active
        ? `dark:text-brand-50 dark:border-brand-50 text-brand-500 border-brand-500`
        : `dark:text-text-500 dark:border-text-500 text-text-400 border-element-light-lighter-500`
    }`

  const contentTab = (item: TabsItem, index: number) => {
    if (item.onClick) {
      return (
        <span
          key={index}
          onClick={item.onClick}
          className={`cursor-pointer flex ${btnClassName} ${btnClassNameActive(item)}`}
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
    <div className={`w-full h-14 flex shrink-0 justify-between items-center rounded-b ${className}`}>
      <div className={`flex gap-1 h-14 ${fullWidth ? 'flex-grow' : ''}`}>
        {items.map((item: TabsItem, index: number) => contentTab(item, index))}
      </div>
      {contentRight && <div className="flex items-center">{contentRight}</div>}
    </div>
  )
}

export default Tabs
