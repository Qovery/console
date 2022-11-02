import { useLocation } from 'react-router-dom'
import ButtonIcon, { ButtonIconStyle } from '../../buttons/button-icon/button-icon'
import Menu, { MenuAlign } from '../../menu/menu'
import { MenuItemProps } from '../../menu/menu-item/menu-item'
import BreadcrumbItemValue from './breadcrumb-item-value/breadcrumb-item-value'

export interface BreadcrumbItemProps {
  data: Array<any> | undefined
  label?: string
  paramId: string
  menuItems: { items: MenuItemProps[]; title?: string; button?: string; buttonLink?: string; search?: boolean }[]
  link: string
  isDark?: boolean
  logo?: React.ReactElement
  isLast?: boolean
}

export function BreadcrumbItem(props: BreadcrumbItemProps) {
  const { data, paramId, menuItems, link, isDark, label, logo, isLast = false } = props
  const { pathname } = useLocation()

  const currentName: string = data && data.find((currentData) => paramId === currentData.id)?.name

  if (!data) return null

  const isActive = pathname === link

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col">
        {label && <span className="text-xs text-text-500 font-medium ml-2">{label}</span>}
        <div className="flex gap-1 items-center">
          <BreadcrumbItemValue link={link} active={isLast} name={currentName} logo={logo} />
          {menuItems.length > 0 && (
            <Menu
              menus={menuItems}
              open={false}
              arrowAlign={MenuAlign.START}
              trigger={
                <ButtonIcon className="btn-icon--circle" icon="icon-solid-angle-down" style={ButtonIconStyle.FLAT} />
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default BreadcrumbItem
