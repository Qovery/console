import { useContext } from 'react'
import { matchPath, useLocation, useParams } from 'react-router-dom'
import { type AnyService } from '@qovery/domains/services/data-access'
import { ServiceLinksPopover, ServiceStateChip, useService } from '@qovery/domains/services/feature'
import { VariablesActionToolbar } from '@qovery/domains/variables/feature'
import {
  APPLICATION_DEPLOYMENTS_URL,
  APPLICATION_GENERAL_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_URL,
  APPLICATION_VARIABLES_URL,
} from '@qovery/shared/routes'
import { Button, Icon, Tabs, type TabsItem, useModal } from '@qovery/shared/ui'
import { ApplicationContext } from '../../ui/container/container'
import CrudEnvironmentVariableModalFeature, {
  EnvironmentVariableCrudMode,
} from '../crud-environment-variable-modal-feature/crud-environment-variable-modal-feature'
import ImportEnvironmentVariableModalFeature from '../import-environment-variable-modal-feature/import-environment-variable-modal-feature'

function ContentRightEnvVariable({
  service,
  organizationId,
  environmentId,
  projectId,
}: {
  service: AnyService
  organizationId: string
  environmentId: string
  projectId: string
}) {
  const { showHideAllEnvironmentVariablesValues: globalShowHideValue, setShowHideAllEnvironmentVariablesValues } =
    useContext(ApplicationContext)
  const { openModal, closeModal } = useModal()
  const serviceType = service?.serviceType

  return (
    <div className="flex items-center gap-2">
      <Button
        color="brand"
        variant="plain"
        className="gap-2"
        onClick={() => {
          setShowHideAllEnvironmentVariablesValues(!globalShowHideValue)
        }}
      >
        <Icon iconName={!globalShowHideValue ? 'eye' : 'eye-slash'} />
        {globalShowHideValue ? 'Hide all' : 'Show all'}
      </Button>
      <VariablesActionToolbar
        onImportEnvFile={() =>
          openModal({
            content: (
              <ImportEnvironmentVariableModalFeature
                environmentId={environmentId}
                closeModal={closeModal}
                applicationId={service.id}
                serviceType={serviceType}
              />
            ),
            options: {
              width: 750,
            },
          })
        }
        onCreateVariable={() =>
          openModal({
            content: (
              <CrudEnvironmentVariableModalFeature
                closeModal={closeModal}
                type="VALUE"
                mode={EnvironmentVariableCrudMode.CREATION}
                organizationId={organizationId}
                applicationId={service.id}
                environmentId={environmentId}
                projectId={projectId}
                serviceType={serviceType}
              />
            ),
          })
        }
        onCreateVariableFile={() =>
          openModal({
            content: (
              <CrudEnvironmentVariableModalFeature
                closeModal={closeModal}
                type="VALUE"
                mode={EnvironmentVariableCrudMode.CREATION}
                organizationId={organizationId}
                applicationId={service.id}
                environmentId={environmentId}
                projectId={projectId}
                serviceType={serviceType}
                isFile
              />
            ),
          })
        }
      />
    </div>
  )
}

export function TabsFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const { data: service } = useService({ environmentId, serviceId: applicationId })
  const location = useLocation()

  const items: TabsItem[] = [
    {
      icon: <ServiceStateChip mode="running" environmentId={service?.environment?.id} serviceId={service?.id} />,
      name: 'Overview',
      active:
        location.pathname ===
        APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_GENERAL_URL,
      link: APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_GENERAL_URL,
    },
    {
      icon: <ServiceStateChip mode="deployment" environmentId={service?.environment?.id} serviceId={service?.id} />,
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

  return (
    <Tabs
      items={items}
      contentRight={
        <div className="px-5">
          {matchEnvVariableRoute && service ? (
            <ContentRightEnvVariable
              service={service}
              organizationId={organizationId}
              environmentId={environmentId}
              projectId={projectId}
            />
          ) : (
            <ServiceLinksPopover
              organizationId={organizationId}
              projectId={projectId}
              environmentId={environmentId}
              serviceId={applicationId}
            >
              <Button className="gap-2" size="lg" color="neutral" variant="surface">
                <Icon iconName="angle-down" />
                Links
                <Icon iconName="link" />
              </Button>
            </ServiceLinksPopover>
          )}
        </div>
      }
    />
  )
}

export default TabsFeature
