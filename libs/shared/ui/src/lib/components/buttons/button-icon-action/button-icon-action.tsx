import ButtonIconActionElement, {
  type ButtonIconActionElementProps,
} from './button-icon-action-element/button-icon-action-element'

export interface ButtonIconActionProps {
  actions?: ButtonIconActionElementProps[]
  className?: string
}

export function ButtonIconAction(props: ButtonIconActionProps) {
  const { actions, className = '' } = props

  return (
    <div data-testid="button-icon-action" className={className} onClick={(e) => e.preventDefault()}>
      {actions &&
        actions.map(
          (action, index) => (action.menus || action.onClick) && <ButtonIconActionElement key={index} {...action} />
        )}
    </div>
  )
}

export default ButtonIconAction
