import { type DeploymentHistoryEnvironmentV2, type Environment, type StateEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import {
  useDeleteAllServices,
  useDeployAllServices,
  useRestartAllServices,
  useStopAllServices,
  useUninstallAllServices,
} from '@qovery/domains/services/feature'
import { Button, Icon, Tooltip, useModalConfirmation } from '@qovery/shared/ui'

export interface RunAgainButtonProps {
  environment: Environment
  deploymentHistory: DeploymentHistoryEnvironmentV2
  state: StateEnum
}

export function RunAgainButton({ environment, deploymentHistory, state }: RunAgainButtonProps) {
  const { openModalConfirmation } = useModalConfirmation()
  const { mutate: deployAllServices } = useDeployAllServices()
  const { mutate: restartAllServices } = useRestartAllServices()
  const { mutate: stopAllServices } = useStopAllServices()
  const { mutate: uninstallAllServices } = useUninstallAllServices()
  const { mutate: deleteAllServices } = useDeleteAllServices()

  const services = deploymentHistory.stages.flatMap((stage) => stage.services ?? [])
  const idsOf = (serviceType: string) =>
    services
      .filter(({ identifier }) => identifier.service_type === serviceType)
      .map(({ identifier }) => identifier.service_id)

  // EnvironmentServiceIdsAllRequest shape, used by stop / uninstall / delete
  const serviceIdsPayload = {
    application_ids: idsOf('APPLICATION'),
    container_ids: idsOf('CONTAINER'),
    database_ids: idsOf('DATABASE'),
    job_ids: idsOf('JOB'),
    helm_ids: idsOf('HELM'),
    terraform_ids: idsOf('TERRAFORM'),
  }

  const runDeploy = () =>
    deployAllServices({
      environment,
      payload: {
        applications: idsOf('APPLICATION').map((id) => ({ application_id: id })),
        containers: idsOf('CONTAINER').map((id) => ({ id })),
        databases: idsOf('DATABASE'),
        jobs: idsOf('JOB').map((id) => ({ id })),
        helms: idsOf('HELM').map((id) => ({ id })),
        terraforms: idsOf('TERRAFORM').map((id) => ({ id })),
      },
    })

  // NOTE: only applications, containers and databases can be restarted
  const runRestart = () =>
    restartAllServices({
      environment,
      payload: {
        application_ids: idsOf('APPLICATION'),
        container_ids: idsOf('CONTAINER'),
        database_ids: idsOf('DATABASE'),
      },
    })

  // Map the deployment's original trigger action to the matching bulk action, scoped to
  // the services in this deployment. `null` = the action type can't be replayed from here.
  const action = match(deploymentHistory.trigger_action)
    .with('DEPLOY', 'DEPLOY_DRY_RUN', () => ({ verb: 'deploy', destructive: false, run: runDeploy }))
    .with('RESTART', () => ({ verb: 'restart', destructive: false, run: runRestart }))
    .with('STOP', () => ({
      verb: 'stop',
      destructive: true,
      run: () => stopAllServices({ environment, payload: serviceIdsPayload }),
    }))
    .with('UNINSTALL', () => ({
      verb: 'uninstall',
      destructive: true,
      run: () => uninstallAllServices({ environment, payload: serviceIdsPayload }),
    }))
    .with('DELETE', () => ({
      verb: 'delete',
      destructive: true,
      run: () => deleteAllServices({ environment, payload: serviceIdsPayload }),
    }))
    .otherwise(() => null)

  const isInProgress = match(state)
    .with(
      'DEPLOYING',
      'RESTARTING',
      'BUILDING',
      'DELETING',
      'CANCELING',
      'STOPPING',
      'DEPLOYMENT_QUEUED',
      'DELETE_QUEUED',
      'STOP_QUEUED',
      'RESTART_QUEUED',
      () => true
    )
    .otherwise(() => false)

  const disabled = isInProgress || action === null

  const handleClick = () => {
    if (!action) return
    if (action.destructive) {
      openModalConfirmation({
        title: `Confirm ${action.verb}`,
        description: `This will ${action.verb} the service(s) included in this deployment. To confirm, please type the name of the environment:`,
        name: environment.name,
        action: action.run,
      })
    } else {
      action.run()
    }
  }

  const tooltipContent =
    action === null
      ? "This deployment's action cannot be repeated"
      : isInProgress
        ? 'A deployment is currently in progress'
        : `Repeat this ${action.verb} on the same service(s)`

  return (
    <Tooltip content={tooltipContent}>
      <div>
        <Button
          aria-label="Run again"
          color="brand"
          variant="solid"
          size="md"
          disabled={disabled}
          onClick={handleClick}
        >
          <span className="flex h-full w-full items-center justify-center gap-1.5">
            <Icon iconName="arrow-rotate-right" />
            Run again
          </span>
        </Button>
      </div>
    </Tooltip>
  )
}

export default RunAgainButton
