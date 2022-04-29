import ButtonIconActionElement, {
  ButtonIconActionElementProps,
} from './button-icon-action-element/button-icon-action-element'

export interface ButtonIconActionProps {
  actions: ButtonIconActionElementProps[]
}

export function ButtonIconAction(props: ButtonIconActionProps) {
  const { actions } = props

  return (
    <div className="btn-icon-action" onClick={(e) => e.preventDefault()}>
      {actions.map((action, index) => (
        <ButtonIconActionElement key={index} {...action} />
      ))}
    </div>
  )
}

export default ButtonIconAction
