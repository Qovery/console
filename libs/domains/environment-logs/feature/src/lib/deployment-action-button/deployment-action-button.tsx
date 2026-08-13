import { type DeploymentHistoryEnvironmentV2, type Environment, type StateEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { useCancelDeploymentEnvironment } from '@qovery/domains/environments/feature'
import {
  useDeleteAllServices,
  useDeployAllServices,
  useRestartAllServices,
  useStopAllServices,
  useUninstallAllServices,
} from '@qovery/domains/services/feature'
import { ENVIRONMENT_LOGS_URL, ENVIRONMENT_STAGES_URL } from '@qovery/shared/routes'
import { Button, Icon, Tooltip, useModalConfirmation } from '@qovery/shared/ui'
import { isCancelBuildAvailable } from '@qovery/shared/util-js'

export interface DeploymentActionButtonProps {
  environment: Environment
  deploymentHistory: DeploymentHistoryEnvironmentV2
  state: StateEnum
}

export function DeploymentActionButton({ environment, deploymentHistory, state }: DeploymentActionButtonProps) {
  const { openModalConfirmation } = useModalConfirmation()

  const logsLink =
    ENVIRONMENT_LOGS_URL(environment.organization.id, environment.project.id, environment.id) + ENVIRONMENT_STAGES_URL()

  const { mutate: cancelDeploymentEnvironment } = useCancelDeploymentEnvironment({
    projectId: environment.project.id,
    logsLink,
  })
  const { mutate: deployAllServices } = useDeployAllServices()
  const { mutate: restartAllServices } = useRestartAllServices()
  const { mutate: stopAllServices } = useStopAllServices()
  const { mutate: uninstallAllServices } = useUninstallAllServices()
  const { mutate: deleteAllServices } = useDeleteAllServices()

  // While a deployment is in progress, offer to cancel it; once finished, offer to run it again.
  if (isCancelBuildAvailable(state)) {
    const handleCancel = () =>
      openModalConfirmation({
        title: 'Confirm cancel',
        description:
          'Stopping a deployment may take a while, as a safe point needs to be reached. Some operations cannot be stopped (i.e: terraform actions) and need to be completed before stopping the deployment. Any action performed before won’t be rolled back. To confirm the cancellation of your deployment, please type the name of the environment:',
        name: environment.name,
        action: () => cancelDeploymentEnvironment({ environmentId: environment.id }),
      })

    return (
      <Tooltip content="Cancel the current deployment">
        <div>
          <Button aria-label="Cancel deployment" color="neutral" variant="outline" size="md" onClick={handleCancel}>
            <span className="flex h-full w-full items-center justify-center gap-1.5">
              <Icon iconName="xmark" />
              Cancel deployment
            </span>
          </Button>
        </div>
      </Tooltip>
    )
  }

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

  // Map the deployment's original trigger action to the matching bulk action, scoped to the
  // services in this deployment. Anything not explicitly handled (plain deploy, dry-run,
  // terraform state ops, unknown) is replayed as a deploy of the same services.
  const action = match(deploymentHistory.trigger_action)
    .with('RESTART', () => ({ verb: 'restart', destructive: false, run: runRestart }))
    .with('STOP', () => ({
      verb: 'stop',
      destructive: true,
      run: () => stopAllServices({ environment, payload: serviceIdsPayload }),
    }))
    .with('UNINSTALL', 'DELETE_RESOURCES_ONLY', () => ({
      verb: 'uninstall',
      destructive: true,
      run: () => uninstallAllServices({ environment, payload: serviceIdsPayload }),
    }))
    .with('DELETE', () => ({
      verb: 'delete',
      destructive: true,
      run: () => deleteAllServices({ environment, payload: serviceIdsPayload }),
    }))
    .otherwise(() => ({ verb: 'deploy', destructive: false, run: runDeploy }))

  const handleRunAgain = () => {
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

  return (
    <Tooltip content={`Repeat this ${action.verb} on the same service(s)`}>
      <div>
        <Button aria-label="Run again" color="brand" variant="solid" size="md" onClick={handleRunAgain}>
          <span className="flex h-full w-full items-center justify-center gap-1.5">
            <Icon iconName="arrow-rotate-right" />
            Run again
          </span>
        </Button>
      </div>
    </Tooltip>
  )
}

export default DeploymentActionButton
