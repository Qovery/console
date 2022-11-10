import { StatusMenuInformation } from '@qovery/shared/ui'
import ButtonIconActionElement, {
  ButtonIconActionElementProps,
} from './button-icon-action-element/button-icon-action-element'

export interface ButtonIconActionProps {
  actions?: ButtonIconActionElementProps[]
  statusInformation?: StatusMenuInformation
  className?: string
  isService?: boolean
}

export function ButtonIconAction(props: ButtonIconActionProps) {
  const { actions, statusInformation, className = '', isService = false } = props

  return (
    <div className={`btn-icon-action ${className}`} onClick={(e) => e.preventDefault()}>
      {actions &&
        actions.map(
          (action, index) =>
            (action.menus || action.statusActions || action.onClick) && (
              <ButtonIconActionElement
                key={index}
                statusInformation={statusInformation}
                isService={isService}
                {...action}
              />
            )
        )}
    </div>
  )
}

export default ButtonIconAction
