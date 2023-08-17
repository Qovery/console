import { type ReactElement } from 'react'
import { ButtonIcon, ButtonIconStyle, Menu, MenuAlign, type MenuData } from '@qovery/shared/ui'
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
        {label && <span className="text-xs text-text-400 dark:text-text-300 font-medium ml-2">{label}</span>}
        <div className="flex gap-1 items-center">
          <BreadcrumbItemValue link={link} active={isLast} name={currentName ?? ''} logo={logo} />
          {menuItems.length > 0 && (
            <Menu
              menus={menuItems}
              open={false}
              arrowAlign={MenuAlign.START}
              trigger={
                <ButtonIcon
                  className="btn-icon--circle"
                  iconClassName="text-element-light-lighter-700 dark:text-element-light-lighter-600"
                  icon="icon-solid-angle-down"
                  style={ButtonIconStyle.FLAT}
                />
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default BreadcrumbItem
