import { StatusMenuRowInformation } from '@console/shared/ui'
import ButtonIconActionElement, {
  ButtonIconActionElementProps,
} from './button-icon-action-element/button-icon-action-element'

export interface ButtonIconActionProps {
  actions: ButtonIconActionElementProps[]
  rowInformation?: StatusMenuRowInformation
}

export function ButtonIconAction(props: ButtonIconActionProps) {
  const { actions, rowInformation } = props

  return (
    <div className="btn-icon-action" onClick={(e) => e.preventDefault()}>
      {actions.map((action, index) => (
        <ButtonIconActionElement key={index} rowInformation={rowInformation} {...action} />
      ))}
    </div>
  )
}

export default ButtonIconAction
