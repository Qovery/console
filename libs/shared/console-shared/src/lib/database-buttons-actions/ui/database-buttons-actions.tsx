import { DatabaseEntity } from '@qovery/shared/interfaces'
import { ButtonIconAction, ButtonIconActionElementProps } from '@qovery/shared/ui'

export interface DatabaseButtonsActionsProps {
  database: DatabaseEntity
  environmentMode: string
  buttonActionsDefault?: ButtonIconActionElementProps[] | undefined
  inHeader?: boolean
}

export function DatabaseButtonsActions(props: DatabaseButtonsActionsProps) {
  const { database, environmentMode, buttonActionsDefault, inHeader = false } = props

  return (
    <ButtonIconAction
      className={`${inHeader ? '!h-8' : ''}`}
      actions={buttonActionsDefault}
      statusInformation={{
        id: database.id,
        name: database.name,
        mode: environmentMode,
      }}
      isService
    />
  )
}

export default DatabaseButtonsActions
