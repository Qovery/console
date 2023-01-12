import { ClickEvent } from '@szhsin/react-menu'
import { StateEnum } from 'qovery-typescript-axios'
import { ReactNode, useContext } from 'react'
import { useSelector } from 'react-redux'
import { matchPath, useLocation, useParams } from 'react-router-dom'
import { getApplicationsState } from '@qovery/domains/application'
import { RunningStatus, getServiceType } from '@qovery/shared/enums'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import {
  APPLICATION_DEPLOYMENTS_URL,
  APPLICATION_GENERAL_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_URL,
  APPLICATION_VARIABLES_URL,
} from '@qovery/shared/routes'
import {
  Button,
  ButtonAction,
  ButtonStyle,
  Icon,
  IconAwesomeEnum,
  MenuData,
  Skeleton,
  StatusChip,
  Tabs,
  TabsItem,
  useModal,
} from '@qovery/shared/ui'
import { RootState } from '@qovery/store'
import { ApplicationContext } from '../../ui/container/container'
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

  const { showHideAllEnvironmentVariablesValues: globalShowHideValue, setShowHideAllEnvironmentVariablesValues } =
    useContext(ApplicationContext)

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
      icon: <Icon name="icon-solid-key" />,
      name: 'Variables',
      active:
        location.pathname ===
        APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_VARIABLES_URL,
      link: APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_VARIABLES_URL,
    },
    {
      icon: <Icon name="icon-solid-wheel" />,
      name: 'Settings',
      active: location.pathname.includes(
        APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_SETTINGS_URL
      ),
      link: APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_SETTINGS_URL,
    },
  ]

  const matchEnvVariableRoute = matchPath(
    location.pathname || '',
    APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_VARIABLES_URL
  )

  let menuForContentRight: MenuData = []

  if (matchEnvVariableRoute) {
    menuForContentRight = [
      {
        items: [
          {
            name: 'Import variables',
            onClick: (e: ClickEvent) => {
              openModal({
                content: (
                  <ImportEnvironmentVariableModalFeature
                    closeModal={closeModal}
                    applicationId={applicationId}
                    serviceType={application && getServiceType(application)}
                  />
                ),
                options: {
                  width: 750,
                },
              })
            },
            contentLeft: <Icon name="icon-solid-cloud-arrow-up" className="text-sm text-brand-400" />,
          },
        ],
      },
    ]
  }

  const contentRight: ReactNode = matchEnvVariableRoute && (
    <>
      <Button
        className="mr-2"
        style={ButtonStyle.FLAT}
        iconLeft={!globalShowHideValue ? IconAwesomeEnum.EYE : IconAwesomeEnum.EYE_SLASH}
        onClick={() => {
          setShowHideAllEnvironmentVariablesValues(!globalShowHideValue)
        }}
      >
        {globalShowHideValue ? 'Hide all' : 'Show all'}
      </Button>
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
                serviceType={application && getServiceType(application)}
              />
            ),
          })
        }}
        iconRight={IconAwesomeEnum.CIRCLE_PLUS}
        menus={menuForContentRight}
      >
        New variable
      </ButtonAction>
    </>
  )

  return <Tabs items={items} contentRight={<div className="px-5">{contentRight}</div>} />
}

export default TabsFeature
