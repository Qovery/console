import ButtonIconActionElement, {
  type ButtonIconActionElementProps,
} from './button-icon-action-element/button-icon-action-element'

export interface ButtonIconActionProps {
  actions?: Omit<ButtonIconActionElementProps, 'isLast'>[]
  className?: string
}

export function ButtonIconAction(props: ButtonIconActionProps) {
  const { actions, className = '' } = props

  return (
    <div
      data-testid="button-icon-action"
      className={`btn-icon-action ${className}`}
      onClick={(e) => e.preventDefault()}
    >
      {actions &&
        actions.map(
          (action, index) =>
            (action.menus || action.onClick) && (
              <ButtonIconActionElement key={index} {...action} isLast={index === actions.length - 1} />
            )
        )}
    </div>
  )
}

export default ButtonIconAction
