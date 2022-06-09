import { Link, useLocation } from 'react-router-dom'
import { ButtonIcon, ButtonIconStyle, Menu, MenuAlign } from '@console/shared/ui'
import { MenuItemProps } from '../../menu/menu-item/menu-item'

export interface BreadcrumbItemProps {
  data: Array<any> | undefined
  paramId: string
  menuItems: { items: MenuItemProps[]; title?: string; button?: string; buttonLink?: string; search?: boolean }[]
  link: string
}

export function BreadcrumbItem(props: BreadcrumbItemProps) {
  const { data, paramId, menuItems, link } = props
  const { pathname } = useLocation()

  const currentName: string = data && data.find((currentData) => paramId === currentData.id)?.name

  if (!data) return null

  const isActive = pathname === link

  return (
    <div className="flex items-center justify-center">
      <Link to={link}>
        <p
          data-testid="label"
          className={`link-transition text-sm font-medium hover:text-text-500 max-w-xs truncate ${
            isActive ? 'text-text-500' : 'text-text-400'
          }`}
        >
          {currentName}
        </p>
      </Link>
      <Menu
        menus={menuItems}
        open={false}
        arrowAlign={MenuAlign.START}
        trigger={
          <ButtonIcon
            className="btn-icon--circle ml-1 mt-0.5"
            icon="icon-solid-angle-down"
            style={ButtonIconStyle.FLAT}
          />
        }
      />
    </div>
  )
}

export default BreadcrumbItem
