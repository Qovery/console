import { ClickEvent } from '@szhsin/react-menu'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import {
  deleteApplicationAction,
  postApplicationActionsDeploy,
  postApplicationActionsRestart,
  postApplicationActionsStop,
} from '@qovery/domains/application'
import { getServiceType } from '@qovery/shared/enums'
import { ApplicationEntity, GitApplicationEntity } from '@qovery/shared/interfaces'
import {
  APPLICATION_LOGS_URL,
  APPLICATION_SETTINGS_GENERAL_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_URL,
} from '@qovery/shared/router'
import {
  ButtonIconActionElementProps,
  Icon,
  IconAwesomeEnum,
  MenuData,
  MenuItemProps,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import {
  copyToClipboard,
  isCancelBuildAvailable,
  isDeleteAvailable,
  isDeployAvailable,
  isRestartAvailable,
  isStopAvailable,
  urlCodeEditor,
} from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/store'
import DeployOtherCommitModalFeature from '../../deploy-other-commit-modal/feature/deploy-other-commit-modal-feature'
import ApplicationButtonsActions from '../ui/application-buttons-actions'

export interface ApplicationButtonsActionsProps {
  application: ApplicationEntity
  environmentMode: string
  inHeader?: boolean
}

export function ApplicationButtonsActionsFeature(props: ApplicationButtonsActionsProps) {
  const { application, environmentMode, inHeader = false } = props
  const { environmentId = '', projectId = '', organizationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { openModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const [buttonStatusActions, setButtonStatusActions] = useState<MenuData>([])

  const removeService = (id: string, name?: string) => {
    openModalConfirmation({
      title: `Delete application`,
      description: `To confirm the deletion of your application, please type the name of the application:`,
      name: name,
      isDelete: true,
      action: () => {
        dispatch(
          deleteApplicationAction({ environmentId, applicationId: id, serviceType: getServiceType(application) })
        )
      },
    })
  }

  useEffect(() => {
    const deployButton: MenuItemProps = {
      name: 'deploy',
      onClick: () =>
        dispatch(
          postApplicationActionsDeploy({
            environmentId,
            applicationId: application.id,
            serviceType: getServiceType(application),
          })
        ),
    }

    const redeployButton: MenuItemProps = {
      name: 'Redeploy',
      contentLeft: <Icon name="icon-solid-rotate-right" className="text-sm text-brand-400" />,
      onClick: (e: ClickEvent) => {
        e.syntheticEvent.preventDefault()

        openModalConfirmation({
          mode: environmentMode,
          title: 'Confirm redeploy',
          description: 'To confirm the redeploy of your environment, please type the name:',
          name: application.name,
          action: () => {
            dispatch(
              postApplicationActionsRestart({
                environmentId,
                applicationId: application.id,
                serviceType: getServiceType(application),
              })
            )
          },
        })
      },
    }

    const stopButton: MenuItemProps = {
      name: 'Stop',
      onClick: () =>
        dispatch(
          postApplicationActionsStop({
            environmentId,
            applicationId: application.id,
            serviceType: getServiceType(application),
          })
        ),
      contentLeft: <Icon name="icon-solid-circle-stop" className="text-sm text-brand-400" />,
    }

    const cancelBuildButton = {
      name: 'Cancel Deployment',
      onClick: (e: ClickEvent) => {
        e.syntheticEvent.preventDefault()
        openModalConfirmation({
          mode: environmentMode,
          title: 'Confirm cancel deployment',
          description: 'To confirm the cancel deployment of your environment, please type the name:',
          name: application.name,
          action: () => {},
        })
      },
      contentLeft: <Icon name="icon-solid-xmark" className="text-sm text-brand-400" />,
    }

    const deployAnotherButton = {
      name: 'Deploy other version',
      contentLeft: <Icon name={IconAwesomeEnum.CLOCK_ROTATE_LEFT} className="text-sm text-brand-400" />,
      onClick: () => {
        openModal({
          content: <DeployOtherCommitModalFeature applicationId={application.id} environmentId={environmentId || ''} />,
          options: { width: 596 },
        })
      },
    }

    const state = application.status?.state
    const topItems: MenuItemProps[] = []
    const bottomItems: MenuItemProps[] = []

    if (state) {
      if (isCancelBuildAvailable(state)) {
        topItems.push(cancelBuildButton)
      }
      if (isDeployAvailable(state)) {
        topItems.push(deployButton)
      }
      if (isRestartAvailable(state)) {
        topItems.push(redeployButton)
      }
      if (isStopAvailable(state)) {
        topItems.push(stopButton)
      }

      bottomItems.push(deployAnotherButton)
    }

    setButtonStatusActions([{ items: topItems }, { items: bottomItems }])
  }, [application, environmentMode, environmentId, dispatch, openModal, openModalConfirmation])

  const canDelete = application.status && isDeleteAvailable(application.status.state)
  const copyContent = `Organization ID: ${organizationId}\nProject ID: ${projectId}\nEnvironment ID: ${environmentId}\nService ID: ${application.id}`

  const buttonActionsDefault: ButtonIconActionElementProps[] = [
    {
      iconLeft: <Icon name="icon-solid-play" className="px-0.5" />,
      iconRight: <Icon name="icon-solid-angle-down" className="px-0.5" />,
      menusClassName: 'border-r border-r-element-light-lighter-500',
      menus: buttonStatusActions,
    },
    {
      iconLeft: <Icon name="icon-solid-scroll" className="px-0.5" />,
      onClick: () => navigate(APPLICATION_LOGS_URL(organizationId, projectId, environmentId, application.id)),
    },
    {
      iconLeft: <Icon name="icon-solid-ellipsis-v" className="px-0.5" />,
      menus: [
        {
          items: [
            {
              name: 'Edit code',
              contentLeft: <Icon name="icon-solid-code" className="text-sm text-brand-400" />,
              link: {
                url: urlCodeEditor((application as GitApplicationEntity)?.git_repository) || '',
                external: true,
              },
            },
            {
              name: 'Copy identifiers',
              contentLeft: <Icon name="icon-solid-copy" className="text-sm text-brand-400" />,
              onClick: () => copyToClipboard(copyContent),
            },
            {
              name: 'Open settings',
              contentLeft: <Icon name={IconAwesomeEnum.WHEEL} className="text-sm text-brand-400" />,
              onClick: () =>
                navigate(
                  `${APPLICATION_URL(
                    organizationId,
                    projectId,
                    environmentId,
                    application.id
                  )}${APPLICATION_SETTINGS_URL}`
                ) + APPLICATION_SETTINGS_GENERAL_URL,
            },
          ],
        },
        ...(canDelete
          ? [
              {
                items: [
                  {
                    name: 'Delete service',
                    containerClassName: 'text-error-600',
                    contentLeft: <Icon name="icon-solid-trash" className="text-sm text-error-600" />,
                    onClick: () => removeService(application.id, application.name),
                  },
                ],
              },
            ]
          : []),
      ],
    },
  ]

  return (
    <ApplicationButtonsActions
      application={application}
      environmentMode={environmentMode}
      buttonActionsDefault={buttonActionsDefault}
      inHeader={inHeader}
    />
  )
}

export default ApplicationButtonsActions
