import { type ClickEvent } from '@szhsin/react-menu'
import { type Link } from 'qovery-typescript-axios'
import { type ReactNode, useContext } from 'react'
import { useSelector } from 'react-redux'
import { matchPath, useLocation, useParams } from 'react-router-dom'
import { getApplicationsState } from '@qovery/domains/application'
import { ServiceLinksPopover, ServiceStateChip } from '@qovery/domains/services/feature'
import { getServiceType } from '@qovery/shared/enums'
import { type ApplicationEntity } from '@qovery/shared/interfaces'
import {
  APPLICATION_DEPLOYMENTS_URL,
  APPLICATION_GENERAL_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_URL,
  APPLICATION_VARIABLES_URL,
} from '@qovery/shared/routes'
import {
  ButtonAction,
  ButtonLegacy,
  ButtonLegacyStyle,
  Icon,
  IconAwesomeEnum,
  IconFa,
  type MenuData,
  Tabs,
  type TabsItem,
  Tooltip,
  useModal,
} from '@qovery/shared/ui'
import { type RootState } from '@qovery/state/store'
import { ApplicationContext } from '../../ui/container/container'
import CrudEnvironmentVariableModalFeature, {
  EnvironmentVariableCrudMode,
  EnvironmentVariableType,
} from '../crud-environment-variable-modal-feature/crud-environment-variable-modal-feature'
import ImportEnvironmentVariableModalFeature from '../import-environment-variable-modal-feature/import-environment-variable-modal-feature'

export function TabsFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId]
  )

  const serviceType = application && getServiceType(application)

  const location = useLocation()
  const { openModal, closeModal } = useModal()

  const { showHideAllEnvironmentVariablesValues: globalShowHideValue, setShowHideAllEnvironmentVariablesValues } =
    useContext(ApplicationContext)

  const items: TabsItem[] = [
    {
      icon: (
        <ServiceStateChip mode="running" environmentId={application?.environment?.id} serviceId={application?.id} />
      ),
      name: 'Overview',
      active:
        location.pathname ===
        APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_GENERAL_URL,
      link: APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_GENERAL_URL,
    },
    {
      icon: (
        <ServiceStateChip mode="deployment" environmentId={application?.environment?.id} serviceId={application?.id} />
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
            name: 'Import from .env file',
            onClick: (e: ClickEvent) => {
              openModal({
                content: (
                  <ImportEnvironmentVariableModalFeature
                    closeModal={closeModal}
                    applicationId={applicationId}
                    serviceType={serviceType}
                  />
                ),
                options: {
                  width: 750,
                },
              })
            },
            contentLeft: <Icon name="icon-solid-cloud-arrow-up" className="text-sm text-brand-500" />,
          },
          {
            name: 'Import from Doppler',
            contentLeft: <Icon name={IconAwesomeEnum.ROTATE} className="text-sm text-brand-500" />,
            contentRight: (
              <Tooltip content="Documentation">
                <a
                  className="ml-2"
                  rel="noreferrer"
                  href="https://hub.qovery.com/docs/using-qovery/integration/secret-manager/doppler/"
                  target="_blank"
                >
                  <IconFa name={IconAwesomeEnum.CIRCLE_INFO} className="text-neutral-400 text-sm" />
                </a>
              </Tooltip>
            ),
            link: {
              url: 'https://dashboard.doppler.com',
              external: true,
            },
          },
        ],
      },
    ]
  }

  const dropdown: MenuData = [
    {
      items: [
        {
          name: 'Variable',
          contentLeft: <Icon name={IconAwesomeEnum.FEATHER} className="text-sm text-brand-500" />,
          onClick: (e: ClickEvent) => {
            openModal({
              content: (
                <CrudEnvironmentVariableModalFeature
                  closeModal={closeModal}
                  type={EnvironmentVariableType.NORMAL}
                  mode={EnvironmentVariableCrudMode.CREATION}
                  organizationId={organizationId}
                  applicationId={applicationId}
                  environmentId={environmentId}
                  projectId={projectId}
                  serviceType={serviceType}
                />
              ),
            })
          },
        },
        {
          name: 'Variable as file',
          contentLeft: <Icon name={IconAwesomeEnum.FILE_LINES} className="text-sm text-brand-500" />,
          onClick: (e: ClickEvent) => {
            openModal({
              content: (
                <CrudEnvironmentVariableModalFeature
                  closeModal={closeModal}
                  type={EnvironmentVariableType.NORMAL}
                  mode={EnvironmentVariableCrudMode.CREATION}
                  organizationId={organizationId}
                  applicationId={applicationId}
                  environmentId={environmentId}
                  projectId={projectId}
                  serviceType={serviceType}
                  isFile
                />
              ),
            })
          },
        },
      ],
    },
  ]

  const contentRightEnvVariable: ReactNode = (
    <>
      <ButtonLegacy
        className="mr-2"
        style={ButtonLegacyStyle.FLAT}
        iconLeft={!globalShowHideValue ? IconAwesomeEnum.EYE : IconAwesomeEnum.EYE_SLASH}
        onClick={() => {
          setShowHideAllEnvironmentVariablesValues(!globalShowHideValue)
        }}
      >
        {globalShowHideValue ? 'Hide all' : 'Show all'}
      </ButtonLegacy>
      <ButtonAction iconRight={IconAwesomeEnum.CIRCLE_PLUS} menus={menuForContentRight} dropdown={dropdown}>
        New variable
      </ButtonAction>
    </>
  )

  // Remove default Qovery links
  const availableLinks = application?.links?.items?.filter((link: Link) => !(link.is_default && link.is_qovery_domain))

  if (!serviceType) return null

  return (
    <Tabs
      items={items}
      contentRight={
        <div className="px-5">
          {matchEnvVariableRoute ? contentRightEnvVariable : <ServiceLinksPopover links={availableLinks} />}
        </div>
      }
    />
  )
}

export default TabsFeature
