import { Link } from 'react-router-dom'

export interface TabsItem {
  icon: React.ReactNode
  name: string
  active?: boolean
  link: string
}

export interface TabsProps {
  items: TabsItem[]
  contentRight?: React.ReactNode
}

export function Tabs(props: TabsProps) {
  const { items = [], contentRight } = props

  return (
    <div className="w-full h-14 bg-white flex justify-between items-center rounded-b">
      <div className="flex gap-1 h-14 pl-4">
        {items.map((item: TabsItem, index: number) => (
          <Link
            to={item.link}
            key={index}
            className={`tab__item tab__item--${
              item?.active ? 'active' : 'noactive'
            } h-14 border-b-2 px-4 flex gap-4 items-center hover:border-brand-500 hover:text-brand-500 group transition ease-in-out duration-200  ${
              item?.active ? 'text-brand-500 border-brand-500' : 'text-text-400 border-element-light-lighter-500'
            }`}
          >
            {item.icon}
            <p className="text-sm font-medium">{item.name}</p>
          </Link>
        ))}
      </div>
      {contentRight && <div className="flex items-center">{contentRight}</div>}
    </div>
  )
}

export default Tabs
