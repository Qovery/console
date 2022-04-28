import { IconEnum } from '@console/shared/enums'
import ButtonIcon, { ButtonIconStyle } from '../buttons/button-icon/button-icon'
import Icon from '../icon/icon'

export interface HeaderProps {
  title: string
  icon?: IconEnum | string
  buttons?: React.ReactNode
  copyTitle?: boolean
  copyContent?: string
  actions?: React.ReactNode
}

export function Header(props: HeaderProps) {
  const { title, icon, buttons, copyTitle = false, copyContent = '', actions } = props

  const copyToClipboard = () => {
    navigator.clipboard.writeText(copyContent)
  }

  return (
    <div className="flex h-32 border-b border-element-light-lighter-400 items-center justify-between bg-white rounded-t p-5">
      <div className="flex gap-4 ml-2 items-center">
        {icon && <Icon name={icon} width="64" />}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 items-center">
            <h1 className="font-bold text-text-700 text-3xl">{title}</h1>
            {copyTitle && (
              <ButtonIcon
                icon="icon-solid-copy"
                style={ButtonIconStyle.FLAT}
                iconClassName="!text-base text-text-400"
                onClick={copyToClipboard}
              />
            )}
          </div>
          {actions && <div className="flex gap-3">{actions}</div>}
        </div>
      </div>
      {buttons && <div className="flex self-end gap-2">{buttons}</div>}
    </div>
  )
}

export default Header
