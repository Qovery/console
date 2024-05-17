import { PostHogFeature } from 'posthog-js/react'
import { type PropsWithChildren } from 'react'
import { matchPath, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useCluster } from '@qovery/domains/clusters/feature'
import {
  EnvironmentActionToolbar,
  EnvironmentMode,
  EnvironmentStateChip,
  useDeployEnvironment,
  useDeploymentStatus,
  useEnvironment,
} from '@qovery/domains/environments/feature'
import { ShowAllVariablesToggle, VariablesActionToolbar, VariablesProvider } from '@qovery/domains/variables/feature'
import { IconEnum } from '@qovery/shared/enums'
import {
  CLUSTER_URL,
  ENVIRONMENT_LOGS_URL,
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_CRONJOB_CREATION_URL,
  SERVICES_DATABASE_CREATION_URL,
  SERVICES_DEPLOYMENTS_URL,
  SERVICES_GENERAL_URL,
  SERVICES_HELM_CREATION_URL,
  SERVICES_LIFECYCLE_CREATION_URL,
  SERVICES_NEW_URL,
  SERVICES_SETTINGS_URL,
  SERVICES_URL,
  SERVICES_VARIABLES_URL,
} from '@qovery/shared/routes'
import {
  Banner,
  Button,
  Header,
  Icon,
  Link,
  Menu,
  MenuAlign,
  type MenuData,
  Section,
  Skeleton,
  Tabs,
  Tooltip,
  toast,
} from '@qovery/shared/ui'

export function Container({ children }: PropsWithChildren) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const { data: environment } = useEnvironment({ environmentId })

  const location = useLocation()
  const navigate = useNavigate()

  const { isLoading: isLoadingDeploymentStatus, data: deploymentStatus } = useDeploymentStatus({
    environmentId: environment?.id,
  })

  const { data: cluster } = useCluster({ organizationId, clusterId: environment?.cluster_id ?? '' })
  const { mutate: deployEnvironment } = useDeployEnvironment({
    projectId,
    logsLink: ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId),
  })

  const matchSettingsRoute = location.pathname.includes(
    SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_SETTINGS_URL
  )

  const headerActions = (
    <div className="flex flex-row items-center gap-4">
      <Skeleton width={150} height={32} show={!environment}>
        {environment ? <EnvironmentActionToolbar environment={environment} /> : <div />}
      </Skeleton>
      <div className="w-px h-4 bg-neutral-250" />
      <div className="flex flex-row items-center gap-2">
        {environment && (
          <Skeleton width={80} height={22} show={!environment?.mode}>
            <EnvironmentMode size="xs" mode={environment.mode} />
          </Skeleton>
        )}
        <Skeleton width={120} height={22} show={!cluster}>
          <Tooltip content={cluster?.name ?? ''}>
            <Link
              as="button"
              color="neutral"
              variant="surface"
              size="xs"
              to={CLUSTER_URL(environment?.organization.id, environment?.cluster_id)}
            >
              <Icon
                name={
                  cluster?.kubernetes === 'SELF_MANAGED'
                    ? IconEnum.KUBERNETES
                    : (environment?.cloud_provider.provider as IconEnum)
                }
                width="16"
              />
              <p className="ml-1.5 max-w-[200px] truncate">{cluster?.name}</p>
            </Link>
          </Tooltip>
        </Skeleton>
      </div>
    </div>
  )

  const tabsItems = [
    {
      icon: <EnvironmentStateChip mode="running" environmentId={environmentId} />,
      name: 'Services',
      active: location.pathname === `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_GENERAL_URL}`,
      link: `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_GENERAL_URL}`,
    },
    {
      icon: <EnvironmentStateChip mode="deployment" environmentId={environmentId} />,
      name: 'Deployments',
      active:
        location.pathname === `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_DEPLOYMENTS_URL}`,
      link: `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_DEPLOYMENTS_URL}`,
    },
    {
      icon: <Icon name="icon-solid-key" />,
      name: 'Variables',
      active: location.pathname === SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_VARIABLES_URL,
      link: SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_VARIABLES_URL,
    },
    {
      icon: <Icon name="icon-solid-wheel" />,
      name: 'Settings',
      active: location.pathname.includes(
        `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_SETTINGS_URL}`
      ),
      link: `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_SETTINGS_URL}`,
    },
  ]

  const newServicesMenu: MenuData = [
    {
      items: [
        {
          name: 'Create application',
          contentLeft: <Icon iconName="layer-group" className="text-brand-500 text-sm" />,
          onClick: () => {
            navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`)
          },
        },
        {
          name: 'Create database',
          contentLeft: <Icon iconName="database" className="text-brand-500 text-sm" />,
          onClick: () => {
            navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_DATABASE_CREATION_URL}`)
          },
        },
        {
          name: 'Create lifecycle job',
          contentLeft: (
            <Icon name={IconEnum.LIFECYCLE_JOB_STROKE} width="14" height="16" className="text-brand-500 text-sm" />
          ),
          onClick: () => {
            navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_LIFECYCLE_CREATION_URL}`)
          },
        },
        {
          name: 'Create cronjob',
          contentLeft: (
            <Icon name={IconEnum.CRON_JOB_STROKE} width="14" height="16" className="text-brand-500 text-sm" />
          ),
          onClick: () => {
            navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_CRONJOB_CREATION_URL}`)
          },
        },
        {
          name: 'Create helm',
          contentLeft: <Icon name={IconEnum.HELM_OFFICIAL} width="14" height="16" className="text-brand-500 text-sm" />,
          onClick: () => {
            navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_HELM_CREATION_URL}`)
          },
        },
      ],
    },
  ]

  const matchEnvVariableRoute = matchPath(
    location.pathname || '',
    SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_VARIABLES_URL
  )

  const toasterCallback = () => {
    deployEnvironment({ environmentId })
  }

  const contentTabs = !matchSettingsRoute && (
    <div className="flex justify-center items-center px-5 h-14">
      {matchEnvVariableRoute ? (
        <>
          <ShowAllVariablesToggle className="mr-2" />
          <VariablesActionToolbar
            scope="ENVIRONMENT"
            projectId={projectId}
            environmentId={environmentId}
            onCreateVariable={() =>
              toast(
                'SUCCESS',
                'Creation success',
                'You need to redeploy your environment for your changes to be applied.',
                toasterCallback,
                undefined,
                'Redeploy'
              )
            }
          />
        </>
      ) : (
        <Skeleton width={154} height={40} show={isLoadingDeploymentStatus}>
          <PostHogFeature
            flag="service-template"
            match={true}
            fallback={
              <Menu
                trigger={
                  <Button id="service-dropdown" size="lg" className="gap-2">
                    New service
                    <Icon iconName="circle-plus" />
                  </Button>
                }
                menus={newServicesMenu}
                arrowAlign={MenuAlign.START}
              />
            }
          >
            <Link
              as="button"
              size="lg"
              id="service-list"
              className="gap-2"
              to={`${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_NEW_URL}`}
            >
              New service
              <Icon iconName="circle-plus" />
            </Link>
          </PostHogFeature>
        </Skeleton>
      )}
    </div>
  )

  const cancelOnGoing = deploymentStatus?.state === 'CANCELING'

  return (
    <VariablesProvider>
      <Section className="flex-1">
        <Header title={environment?.name} icon={IconEnum.SERVICES} actions={headerActions} />
        <Tabs items={tabsItems} contentRight={contentTabs} />
        {cancelOnGoing && <Banner color="yellow">Deployment cancel ongoing...</Banner>}
        {children}
      </Section>
    </VariablesProvider>
  )
}

export default Container
