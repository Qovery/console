import { ApplicationEntity } from '@qovery/shared/interfaces'
import { ButtonIconAction, ButtonIconActionElementProps } from '@qovery/shared/ui'

export interface ApplicationButtonsActionsProps {
  application: ApplicationEntity
  environmentMode: string
  buttonActionsDefault: ButtonIconActionElementProps[] | undefined
}

export function ApplicationButtonsActions(props: ApplicationButtonsActionsProps) {
  const { buttonActionsDefault } = props

  return <ButtonIconAction className="!h-8" actions={buttonActionsDefault} />
}

export default ApplicationButtonsActions
