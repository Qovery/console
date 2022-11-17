import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import {
  deleteApplicationAction,
  postApplicationActionsDeploy,
  postApplicationActionsRestart,
  postApplicationActionsStop,
} from '@qovery/domains/application'
import { ServiceTypeEnum, getServiceType } from '@qovery/shared/enums'
import { ApplicationEntity, GitApplicationEntity } from '@qovery/shared/interfaces'
import { APPLICATION_LOGS_URL, DEPLOYMENT_LOGS_URL } from '@qovery/shared/router'
import { Icon, IconAwesomeEnum, StatusMenuActions, useModal, useModalConfirmation } from '@qovery/shared/ui'
import { copyToClipboard, isDeleteAvailable, urlCodeEditor } from '@qovery/shared/utils'
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

  const buttonActions: StatusMenuActions[] = [
    {
      name: 'redeploy',
      action: (applicationId: string) =>
        dispatch(
          postApplicationActionsRestart({ environmentId, applicationId, serviceType: getServiceType(application) })
        ),
    },
    {
      name: 'deploy',
      action: (applicationId: string) =>
        dispatch(
          postApplicationActionsDeploy({ environmentId, applicationId, serviceType: getServiceType(application) })
        ),
    },
    {
      name: 'stop',
      action: (applicationId: string) =>
        dispatch(
          postApplicationActionsStop({ environmentId, applicationId, serviceType: getServiceType(application) })
        ),
    },
  ]

  const canDelete = application.status && isDeleteAvailable(application.status.state)
  const copyContent = `Organization ID: ${organizationId}\nProject ID: ${projectId}\nEnvironment ID: ${environmentId}\nService ID: ${application.id}`

  const buttonActionsDefault = [
    {
      iconLeft: <Icon name="icon-solid-play" className="px-0.5" />,
      iconRight: <Icon name="icon-solid-angle-down" className="px-0.5" />,
      menusClassName: 'border-r border-r-element-light-lighter-500',
      statusActions: {
        status: application?.status && application?.status.state,
        actions: buttonActions,
      },
    },
    {
      ...(application &&
        (getServiceType(application) === ServiceTypeEnum.APPLICATION ||
          getServiceType(application) === ServiceTypeEnum.CONTAINER) && {
          iconLeft: <Icon name="icon-solid-scroll" className="px-0.5" />,
          iconRight: <Icon name="icon-solid-angle-down" className="px-0.5" />,
          menusClassName: 'border-r border-r-element-light-lighter-500',
          menus: [
            {
              items: [
                {
                  name: 'Deployment logs',
                  contentLeft: <Icon name="icon-solid-scroll" className="text-brand-500 text-sm" />,
                  onClick: () => navigate(DEPLOYMENT_LOGS_URL(organizationId, projectId, environmentId)),
                },
                {
                  name: 'Application logs',
                  contentLeft: <Icon name="icon-solid-scroll" className="text-brand-500 text-sm" />,
                  onClick: () =>
                    navigate(APPLICATION_LOGS_URL(organizationId, projectId, environmentId, application.id)),
                },
              ],
            },
          ],
        }),
    },
    {
      ...(canDelete && {
        iconLeft: <Icon name="icon-solid-ellipsis-v" className="px-0.5" />,
        menus: [
          {
            items:
              application && getServiceType(application) === ServiceTypeEnum.APPLICATION
                ? [
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
                      name: 'Deploy other version',
                      contentLeft: <Icon name={IconAwesomeEnum.CLOCK_ROTATE_LEFT} className="text-sm text-brand-400" />,
                      onClick: () => {
                        openModal({
                          content: (
                            <DeployOtherCommitModalFeature
                              applicationId={application.id}
                              environmentId={environmentId || ''}
                            />
                          ),
                          options: { width: 596 },
                        })
                      },
                    },
                    {
                      name: 'Remove',
                      contentLeft: <Icon name="icon-solid-trash" className="text-sm text-brand-400" />,
                      onClick: () => removeService(application.id, application.name),
                    },
                  ]
                : [
                    {
                      name: 'Remove',
                      contentLeft: <Icon name="icon-solid-trash" className="text-sm text-brand-400" />,
                      onClick: () => removeService(application.id, application.name),
                    },
                  ],
          },
        ],
      }),
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
