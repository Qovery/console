import { type ReactElement } from 'react'
import { Button, Icon, Menu, MenuAlign, type MenuData } from '@qovery/shared/ui'
import BreadcrumbItemValue from './breadcrumb-item-value/breadcrumb-item-value'

export interface BreadcrumbItemProps {
  data: { id: string | number; name: string }[] | undefined
  label?: string
  paramId: string
  menuItems: MenuData
  link: string
  logo?: ReactElement
  isLast?: boolean
}

export function BreadcrumbItem(props: BreadcrumbItemProps) {
  const { data, paramId, menuItems, link, label, logo, isLast = false } = props

  const currentName = data && data.find((currentData) => paramId === currentData.id)?.name

  if (!data) return null

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col">
        {label && <span className="ml-2 text-xs font-medium text-neutral-350 dark:text-neutral-300">{label}</span>}
        <div className="flex items-center">
          <BreadcrumbItemValue link={link} active={isLast} name={currentName ?? ''} logo={logo} />
          {menuItems.length > 0 && (
            <Menu
              menus={menuItems}
              open={false}
              portal={false}
              arrowAlign={MenuAlign.START}
              paddingMenuX={12}
              paddingMenuY={12}
              trigger={
                <Button type="button" variant="plain" radius="full">
                  <Icon iconName="angle-down" />
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default BreadcrumbItem
