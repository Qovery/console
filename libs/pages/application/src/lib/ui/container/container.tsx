import { useQueryClient } from '@tanstack/react-query'
import { type Environment, ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren, createContext, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { postApplicationActionsDeploy, postApplicationActionsRedeploy } from '@qovery/domains/application'
import { useCluster } from '@qovery/domains/clusters/feature'
import { EnvironmentMode } from '@qovery/domains/environments/feature'
import { type AnyService } from '@qovery/domains/services/data-access'
import { useDeploymentStatus } from '@qovery/domains/services/feature'
import { ApplicationButtonsActions, NeedRedeployFlag } from '@qovery/shared/console-shared'
import { IconEnum, isCronJob, isLifeCycleJob } from '@qovery/shared/enums'
import { type ApplicationEntity } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Badge, Header, Icon, Section, Skeleton, Tooltip } from '@qovery/shared/ui'
import { type AppDispatch } from '@qovery/state/store'
import TabsFeature from '../../feature/tabs-feature/tabs-feature'

export const ApplicationContext = createContext<{
  showHideAllEnvironmentVariablesValues: boolean
  setShowHideAllEnvironmentVariablesValues: (b: boolean) => void
}>({
  showHideAllEnvironmentVariablesValues: false,
  setShowHideAllEnvironmentVariablesValues: (b: boolean) => {},
})

export interface ContainerProps {
  service?: AnyService
  environment?: Environment
}

export function Container({ service, environment, children }: PropsWithChildren<ContainerProps>) {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const [showHideAllEnvironmentVariablesValues, setShowHideAllEnvironmentVariablesValues] = useState<boolean>(false)
  const queryClient = useQueryClient()

  const { data: cluster } = useCluster({ organizationId, clusterId: environment?.cluster_id ?? '' })

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { data: serviceDeploymentStatus, isLoading: isLoadingServiceDeploymentStatus } = useDeploymentStatus({
    environmentId,
    serviceId: service?.id,
  })

  const redeployApplication = () => {
    if (service) {
      if (serviceDeploymentStatus?.service_deployment_status === ServiceDeploymentStatusEnum.NEVER_DEPLOYED) {
        dispatch(
          postApplicationActionsDeploy({
            environmentId,
            applicationId,
            serviceType: service.serviceType,
            callback: () =>
              navigate(
                ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(applicationId)
              ),
            queryClient,
          })
        )
      } else {
        dispatch(
          postApplicationActionsRedeploy({
            environmentId,
            applicationId,
            serviceType: service.serviceType,
            callback: () =>
              navigate(
                ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(applicationId)
              ),
            queryClient,
          })
        )
      }
    }
  }

  const headerActions = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row gap-2">
        {environment && (
          <Skeleton width={80} height={22} show={!environment?.mode}>
            <EnvironmentMode size="xs" mode={environment.mode} />
          </Skeleton>
        )}
        <Skeleton width={120} height={22} show={!cluster}>
          <Tooltip content={cluster?.name ?? ''}>
            <Badge size="xs" variant="outline">
              <Icon name={environment?.cloud_provider.provider as IconEnum} width="16" />
              <p className="ml-1.5 max-w-[200px] truncate">{cluster?.name}</p>
            </Badge>
          </Tooltip>
        </Skeleton>
      </div>
      <Skeleton width={150} height={32} show={isLoadingServiceDeploymentStatus}>
        <div className="flex">
          {environment && service && (
            <ApplicationButtonsActions
              application={service as ApplicationEntity}
              environmentMode={environment.mode}
              clusterId={environment.cluster_id}
            />
          )}
        </div>
      </Skeleton>
    </div>
  )

  return (
    <ApplicationContext.Provider
      value={{ showHideAllEnvironmentVariablesValues, setShowHideAllEnvironmentVariablesValues }}
    >
      <Section className="flex-1">
        <Header
          title={service?.name}
          icon={
            isCronJob(service as ApplicationEntity)
              ? IconEnum.CRON_JOB
              : isLifeCycleJob(service as ApplicationEntity)
              ? IconEnum.LIFECYCLE_JOB
              : service?.serviceType === 'HELM'
              ? IconEnum.HELM
              : IconEnum.APPLICATION
          }
          actions={headerActions}
        />
        <TabsFeature />
        {service && serviceDeploymentStatus?.service_deployment_status !== ServiceDeploymentStatusEnum.UP_TO_DATE && (
          <NeedRedeployFlag service={service as ApplicationEntity} onClickCTA={redeployApplication} />
        )}
        {children}
      </Section>
    </ApplicationContext.Provider>
  )
}

export default Container
