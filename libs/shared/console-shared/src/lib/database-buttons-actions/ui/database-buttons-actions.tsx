import { DatabaseEntity } from '@qovery/shared/interfaces'
import { ButtonIconAction, ButtonIconActionElementProps } from '@qovery/shared/ui'

export interface DatabaseButtonsActionsProps {
  database: DatabaseEntity
  environmentMode: string
  buttonActionsDefault?: ButtonIconActionElementProps[] | undefined
}

export function DatabaseButtonsActions(props: DatabaseButtonsActionsProps) {
  const { buttonActionsDefault } = props

  return <ButtonIconAction className="!h-8" actions={buttonActionsDefault} />
}

export default DatabaseButtonsActions
