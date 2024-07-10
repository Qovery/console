import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { matchPath, useLocation, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import {
  ServiceAccessModal,
  ServiceLinksPopover,
  ServiceStateChip,
  useDeployService,
  useService,
} from '@qovery/domains/services/feature'
import { ShowAllVariablesToggle, VariablesActionToolbar } from '@qovery/domains/variables/feature'
import {
  APPLICATION_DEPLOYMENTS_URL,
  APPLICATION_GENERAL_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_URL,
  APPLICATION_VARIABLES_URL,
} from '@qovery/shared/routes'
import { Button, Icon, Tabs, type TabsItem, toast, useModal } from '@qovery/shared/ui'
import ImportEnvironmentVariableModalFeature from '../import-environment-variable-modal-feature/import-environment-variable-modal-feature'

function ContentRightEnvVariable({ projectId, service }: { projectId: string; service: AnyService }) {
  const {
    serviceType,
    id: serviceId,
    environment: { id: environmentId },
  } = service
  const scope = match(serviceType)
    .with('APPLICATION', () => APIVariableScopeEnum.APPLICATION)
    .with('CONTAINER', () => APIVariableScopeEnum.CONTAINER)
    .with('JOB', () => APIVariableScopeEnum.JOB)
    .with('HELM', () => APIVariableScopeEnum.HELM)
    .otherwise(() => undefined)

  const { openModal, closeModal } = useModal()
  const { mutate: deployService } = useDeployService({ environmentId })
  const toasterCallback = () => {
    deployService({
      serviceId,
      serviceType,
    })
  }

  return (
    <div className="flex items-center gap-2">
      <ShowAllVariablesToggle />
      {scope && (
        <VariablesActionToolbar
          scope={scope}
          projectId={projectId}
          environmentId={service.environment.id}
          serviceId={service.id}
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
            toast(
              'SUCCESS',
              'Creation success',
              'You need to redeploy your service for your changes to be applied.',
              toasterCallback,
              undefined,
              'Redeploy'
            )
          }
        />
      )}
    </div>
  )
}

export function TabsFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const { data: service } = useService({ environmentId, serviceId: applicationId })
  const { closeModal, openModal } = useModal()
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
            <ContentRightEnvVariable service={service} projectId={projectId} />
          ) : (
            <div className="flex gap-3">
              <ServiceLinksPopover
                organizationId={organizationId}
                projectId={projectId}
                environmentId={environmentId}
                serviceId={applicationId}
              >
                <Button className="gap-2" size="md" color="neutral" variant="surface">
                  Links
                  <Icon iconName="link" />
                </Button>
              </ServiceLinksPopover>
              {match(service)
                .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (s) => (
                  <Button
                    className="gap-2"
                    size="md"
                    color="neutral"
                    variant="surface"
                    onClick={() =>
                      openModal({
                        content: (
                          <ServiceAccessModal
                            organizationId={organizationId}
                            projectId={projectId}
                            service={s}
                            onClose={closeModal}
                          />
                        ),
                        options: {
                          width: 680,
                        },
                      })
                    }
                  >
                    Access info
                    <Icon iconName="info-circle" iconStyle="light" />
                  </Button>
                ))
                .otherwise(() => null)}
            </div>
          )}
        </div>
      }
    />
  )
}

export default TabsFeature
