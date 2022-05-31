import ButtonIconActionElement, {
  ButtonIconActionElementProps,
} from './button-icon-action-element/button-icon-action-element'

export interface ButtonIconActionProps {
  actions: ButtonIconActionElementProps[]
  name?: string
}

export function ButtonIconAction(props: ButtonIconActionProps) {
  const { actions, name } = props

  return (
    <div className="btn-icon-action" onClick={(e) => e.preventDefault()}>
      {actions.map((action, index) => (
        <ButtonIconActionElement key={index} {...action} name={name} />
      ))}
    </div>
  )
}

export default ButtonIconAction
