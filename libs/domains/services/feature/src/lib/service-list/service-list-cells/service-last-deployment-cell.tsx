import { type Environment } from 'qovery-typescript-axios'
import { type AnyService } from '@qovery/domains/services/data-access'
import { DevopsCopilotTroubleshootTrigger } from '@qovery/shared/devops-copilot/feature'
import { DeploymentAction, StatusChip } from '@qovery/shared/ui'
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

  return (
    <div className="flex h-full w-full items-center">
      <div className="flex w-full items-center justify-between">
        <DeploymentAction status={triggerAction} />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {deploymentStatus?.status_details?.status === 'ERROR' && (
              <DevopsCopilotTroubleshootTrigger
                source="service-deployment-list"
                deploymentId={deploymentStatus?.execution_id}
                message={
                  deploymentStatus?.execution_id
                    ? `Why did my deployment fail? (execution id: ${deploymentStatus?.execution_id})`
                    : 'Why did my deployment fail?'
                }
              />
            )}
            <StatusChip status={deploymentStatus?.status_details?.status} variant="monochrome" />
          </div>
        </div>
      </div>
    </div>
  )
}
