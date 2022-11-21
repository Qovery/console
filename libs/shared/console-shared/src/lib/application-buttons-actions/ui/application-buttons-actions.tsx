import { ApplicationEntity } from '@qovery/shared/interfaces'
import { ButtonIconAction, ButtonIconActionElementProps } from '@qovery/shared/ui'

export interface ApplicationButtonsActionsProps {
  application: ApplicationEntity
  environmentMode: string
  buttonActionsDefault: ButtonIconActionElementProps[] | undefined
  inHeader?: boolean
}

export function ApplicationButtonsActions(props: ApplicationButtonsActionsProps) {
  const { buttonActionsDefault, inHeader } = props

  return <ButtonIconAction className={`${inHeader ? '!h-8' : ''}`} actions={buttonActionsDefault} />
}

export default ApplicationButtonsActions
