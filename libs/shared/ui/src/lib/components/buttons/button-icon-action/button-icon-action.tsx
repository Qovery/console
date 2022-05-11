import { GlobalDeploymentStatus } from 'qovery-typescript-axios'
import ButtonIconActionElement, {
  ButtonIconActionElementProps,
} from './button-icon-action-element/button-icon-action-element'

export interface ButtonIconActionProps {
  actions: ButtonIconActionElementProps[]
  status?: GlobalDeploymentStatus
}

export function ButtonIconAction(props: ButtonIconActionProps) {
  const { actions, status } = props

  return (
    <div className="btn-icon-action" onClick={(e) => e.preventDefault()}>
      {actions.map((action, index) => (
        <ButtonIconActionElement key={index} {...action} status={status} />
      ))}
    </div>
  )
}

export default ButtonIconAction
