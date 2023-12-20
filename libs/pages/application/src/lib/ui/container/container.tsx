import { type Environment } from 'qovery-typescript-axios'
import { type PropsWithChildren, createContext, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCluster } from '@qovery/domains/clusters/feature'
import { EnvironmentMode } from '@qovery/domains/environments/feature'
import { type AnyService } from '@qovery/domains/services/data-access'
import { NeedRedeployFlag, ServiceActionToolbar } from '@qovery/domains/services/feature'
import { ApplicationButtonsActions } from '@qovery/shared/console-shared'
import { IconEnum, isCronJob, isLifeCycleJob } from '@qovery/shared/enums'
import { type ApplicationEntity } from '@qovery/shared/interfaces'
import { Badge, Header, Icon, Section, Skeleton, Tooltip } from '@qovery/shared/ui'
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
  const { organizationId = '' } = useParams()
  const [showHideAllEnvironmentVariablesValues, setShowHideAllEnvironmentVariablesValues] = useState<boolean>(false)

  const { data: cluster } = useCluster({ organizationId, clusterId: environment?.cluster_id ?? '' })

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
      <Skeleton width={150} height={32} show={!!service}>
        {environment && (
          <div className="flex">
            {service?.serviceType === 'HELM' ? (
              <ServiceActionToolbar serviceId={service.id} />
            ) : (
              service && (
                <ApplicationButtonsActions
                  application={service as ApplicationEntity}
                  environmentMode={environment.mode}
                  clusterId={environment.cluster_id}
                />
              )
            )}
          </div>
        )}
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
        <NeedRedeployFlag />
        {children}
      </Section>
    </ApplicationContext.Provider>
  )
}

export default Container
