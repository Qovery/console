import { StatusMenuInformation } from '@console/shared/ui'
import ButtonIconActionElement, {
  ButtonIconActionElementProps,
} from './button-icon-action-element/button-icon-action-element'

export interface ButtonIconActionProps {
  actions: ButtonIconActionElementProps[]
  statusInformation?: StatusMenuInformation
}

export function ButtonIconAction(props: ButtonIconActionProps) {
  const { actions, statusInformation } = props

  return (
    <div className="btn-icon-action" onClick={(e) => e.preventDefault()}>
      {actions.map((action, index) => (
        <ButtonIconActionElement key={index} statusInformation={statusInformation} {...action} />
      ))}
    </div>
  )
}

export default ButtonIconAction
