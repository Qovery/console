import { StatusMenuInformation } from '@console/shared/ui'
import ButtonIconActionElement, {
  ButtonIconActionElementProps,
} from './button-icon-action-element/button-icon-action-element'

export interface ButtonIconActionProps {
  actions?: ButtonIconActionElementProps[]
  statusInformation?: StatusMenuInformation
  className?: string
}

export function ButtonIconAction(props: ButtonIconActionProps) {
  const { actions, statusInformation, className = '' } = props

  return (
    <div className={`btn-icon-action ${className}`} onClick={(e) => e.preventDefault()}>
      {actions &&
        actions.map(
          (action, index) =>
            (action.menus || action.statusActions) && (
              <ButtonIconActionElement key={index} statusInformation={statusInformation} {...action} />
            )
        )}
    </div>
  )
}

export default ButtonIconAction
