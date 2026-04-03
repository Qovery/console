import { type Environment } from 'qovery-typescript-axios'
import { PropsWithChildren, useCallback } from 'react'
import { type AnyService } from '@qovery/domains/services/data-access'
import { DevopsCopilotTroubleshootTrigger } from '@qovery/shared/devops-copilot/feature'
import { DeploymentAction, Link, StatusChip } from '@qovery/shared/ui'
import { useServiceDeploymentAndRunningStatuses } from '../../hooks/use-service-deployment-and-running-statuses/use-service-deployment-and-running-statuses'

type ServiceLastDeploymentCellProps = {
  service: AnyService
  environment: Environment
}

export function ServiceLastDeploymentCell({ service, environment }: ServiceLastDeploymentCellProps) {
  const {
    data: { deploymentStatus },
  } = useServiceDeploymentAndRunningStatuses({ environmentId: environment.id, service })
  const subAction = deploymentStatus?.status_details?.sub_action
  const triggerAction = subAction !== 'NONE' ? subAction : deploymentStatus?.status_details?.action

  const WrappingLink = useCallback(
    ({ children }: PropsWithChildren) => {
      return (
        <Link
          to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/logs/$executionId"
          params={{
            organizationId: environment.organization.id,
            projectId: environment.project.id,
            environmentId: environment.id,
            serviceId: service.id,
            executionId: deploymentStatus?.execution_id ?? '',
          }}
          underline
          color="neutral"
          className="flex h-full items-center justify-between py-1 font-normal hover:text-neutral"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          {children}
        </Link>
      )
    },
    [environment, service, deploymentStatus?.execution_id]
  )

  return deploymentStatus?.state === 'READY' ? (
    <span className="text-sm font-normal text-neutral-subtle">Never been deployed</span>
  ) : (
    <div className="flex w-full items-center justify-between gap-4">
      <WrappingLink>
        <DeploymentAction status={triggerAction} />
      </WrappingLink>
      <div>
        <div className="flex items-center gap-2">
          {deploymentStatus?.status_details?.status === 'ERROR' && (
            <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
              <DevopsCopilotTroubleshootTrigger
                source="service-deployment-list"
                deploymentId={deploymentStatus?.execution_id}
                message={
                  deploymentStatus?.execution_id
                    ? `Why did my deployment fail? (execution id: ${deploymentStatus?.execution_id})`
                    : 'Why did my deployment fail?'
                }
              />
            </div>
          )}
          <WrappingLink>
            <StatusChip status={deploymentStatus?.status_details?.status} variant="monochrome" />
          </WrappingLink>
        </div>
      </div>
    </div>
  )
}
