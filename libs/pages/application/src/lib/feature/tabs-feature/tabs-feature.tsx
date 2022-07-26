import { ButtonAction, Icon, MenuItemProps, Skeleton, StatusChip, Tabs, TabsItem, useModal } from '@console/shared/ui'
import { ReactNode } from 'react'
import { RunningStatus } from '@console/shared/enums'
import {
  APPLICATION_DEPLOYMENTS_URL,
  APPLICATION_GENERAL_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_URL,
  APPLICATION_VARIABLES_URL,
} from '@console/shared/router'
import { StateEnum } from 'qovery-typescript-axios'
import { matchPath, useLocation, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { RootState } from '@console/store/data'
import { ApplicationEntity } from '@console/shared/interfaces'
import { getApplicationsState } from '@console/domains/application'
import { ClickEvent } from '@szhsin/react-menu'
import CrudEnvironmentVariableModalFeature, {
  EnvironmentVariableCrudMode,
  EnvironmentVariableType,
} from '../crud-environment-variable-modal-feature/crud-environment-variable-modal-feature'
import ImportEnvironmentVariableModalFeature from '../import-environment-variable-modal-feature/import-environment-variable-modal-feature'

export function TabsFeature() {
  const { organizationId, projectId = '', environmentId = '', applicationId = '' } = useParams()
  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId]
  )
  const location = useLocation()
  const { openModal, closeModal } = useModal()

  const items: TabsItem[] = [
    {
      icon: (
        <StatusChip
          status={(application?.running_status && application?.running_status.state) || RunningStatus.STOPPED}
          appendTooltipMessage={
            application?.running_status?.state === RunningStatus.ERROR
              ? application.running_status.pods[0]?.state_message
              : ''
          }
        />
      ),
      name: 'Overview',
      active:
        location.pathname ===
        APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_GENERAL_URL,
      link: APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_GENERAL_URL,
    },
    {
      icon: (
        <Skeleton show={application?.status?.state === StateEnum.STOPPING} width={16} height={16} rounded={true}>
          <StatusChip
            mustRenameStatus
            status={(application?.status && application?.status.state) || StateEnum.STOPPED}
            appendTooltipMessage={application?.status && application.status.message ? application.status.message : ''}
          />
        </Skeleton>
      ),
      name: 'Deployments',
      active:
        location.pathname ===
        APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_DEPLOYMENTS_URL,
      link: APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_DEPLOYMENTS_URL,
    },
    {
      icon: <Icon name="icon-solid-wheel" />,
      name: 'Settings',
      active:
        location.pathname ===
        APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_SETTINGS_URL,
      link: APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_SETTINGS_URL,
    },
    /*{
      icon: <Icon name="icon-solid-chart-area" />,
      name: 'Metrics',
      active:
        location.pathname ===
        APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_METRICS_URL,
      link: APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_METRICS_URL,
    },*/
    {
      icon: <Icon name="icon-solid-wheel" />,
      name: 'Variables',
      active:
        location.pathname ===
        APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_VARIABLES_URL,
      link: APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_VARIABLES_URL,
    },
  ]

  const matchEnvVariableRoute = matchPath(
    location.pathname || '',
    APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_VARIABLES_URL
  )

  let menuForContentRight: {
    items: MenuItemProps[]
    title?: string
    button?: string
    buttonLink?: string
    search?: boolean
  }[] = []

  if (matchEnvVariableRoute) {
    menuForContentRight = [
      {
        items: [
          {
            name: 'Import variables',
            onClick: (e: ClickEvent) => {
              setOpenModal(true)
              setContentModal(
                <ImportEnvironmentVariableModalFeature setOpen={setOpenModal} applicationId={applicationId} />
              )
            },
            contentLeft: <Icon name="icon-solid-cloud-arrow-up" className="text-sm text-brand-400" />,
          },
          {
            name: 'Export Terraform file',
            onClick: (e: ClickEvent) => console.log(e, 'Stop'),
            contentLeft: <Icon name="icon-solid-cloud-arrow-down" className="text-sm text-brand-400" />,
          },
        ],
      },
    ]
  }

  const contentRight: ReactNode = matchEnvVariableRoute && (
    <ButtonAction
      onClick={() => {
        openModal({
          content: (
            <CrudEnvironmentVariableModalFeature
              closeModal={closeModal}
              type={EnvironmentVariableType.NORMAL}
              mode={EnvironmentVariableCrudMode.CREATION}
              applicationId={applicationId}
              environmentId={environmentId}
              projectId={projectId}
            />
          ),
        })
      }}
      iconRight="icon-solid-plus"
      menus={menuForContentRight}
    >
      New variable
    </ButtonAction>
  )

  return <Tabs items={items} contentRight={<div className="px-5">{contentRight}</div>} />
}

export default TabsFeature
