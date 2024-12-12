import { type Environment } from 'qovery-typescript-axios'
import { useDeployAllServices } from '@qovery/domains/environments/feature'
import { Button, Callout, DropdownMenu, Icon, Tooltip, useModal, useModalConfirmation } from '@qovery/shared/ui'
import {
  isDeleteAvailable,
  isDeployAvailable,
  isRedeployAvailable,
  isRestartAvailable,
  isStopAvailable,
  pluralize,
  twMerge,
  upperCaseFirstLetter,
} from '@qovery/shared/util-js'
import { useDeleteAllServices } from '../hooks/use-delete-all-services/use-delete-all-services'
import { useRestartAllServices } from '../hooks/use-restart-all-services/use-restart-all-services'
import { type useServices } from '../hooks/use-services/use-services'
import { useStopAllServices } from '../hooks/use-stop-all-services/use-stop-all-services'

function ConfirmationModal({
  verb,
  impactedRows,
  selectedRows,
  onCancel,
  onSubmit,
}: {
  verb: string
  impactedRows: ReturnType<typeof useServices>['data']
  selectedRows: ReturnType<typeof useServices>['data']
  onCancel: () => void
  onSubmit: () => void
}) {
  const count = impactedRows.length
  const selectedRowsCount = selectedRows.length

  return (
    <div className="p-6">
      <h2 className="h4 max-w-sm truncate text-neutral-400">Confirm</h2>
      <p className="my-2 text-sm text-neutral-350">
        You are going to {verb} {count} {pluralize(count, 'service')}. Are you sure?
      </p>
      {selectedRowsCount !== count && (
        <Callout.Root color="yellow">
          <Callout.Icon>
            <Icon iconName="triangle-exclamation" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>Some services will not be impacted:</Callout.TextHeading>
            <Callout.TextDescription>
              <ul className="list-disc pl-4">
                {selectedRows
                  .filter(({ id: selectedId }) => !impactedRows.find(({ id }) => id === selectedId))
                  .map(({ id, name }) => (
                    <li key={id}>{name}</li>
                  ))}
              </ul>
            </Callout.TextDescription>
          </Callout.Text>
        </Callout.Root>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Button size="lg" variant="surface" color="neutral" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="lg" variant="solid" onClick={onSubmit}>
          {upperCaseFirstLetter(verb)}
        </Button>
      </div>
    </div>
  )
}

export interface ServiceListActionBarProps {
  environment: Environment
  selectedRows: ReturnType<typeof useServices>['data']
  resetRowSelection: () => void
}

export function ServiceListActionBar({ environment, selectedRows, resetRowSelection }: ServiceListActionBarProps) {
  const hasSelection = Boolean(selectedRows.length)

  const { mutateAsync: deployAllServices } = useDeployAllServices()
  const { mutateAsync: restartAllServices } = useRestartAllServices()
  const { mutateAsync: deleteAllServices } = useDeleteAllServices()
  const { mutateAsync: stopAllServices } = useStopAllServices()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const restartableServices = selectedRows.filter(
    ({ deploymentStatus, runningStatus }) =>
      deploymentStatus && runningStatus.state && isRestartAvailable(runningStatus.state, deploymentStatus.state)
  )
  const deletableServices = selectedRows.filter(
    ({ deploymentStatus }) => deploymentStatus && isDeleteAvailable(deploymentStatus.state)
  )
  const deployableServices = selectedRows.filter(
    ({ deploymentStatus }) =>
      deploymentStatus && (isDeployAvailable(deploymentStatus.state) || isRedeployAvailable(deploymentStatus.state))
  )
  const stoppableServices = selectedRows.filter(
    ({ deploymentStatus }) => deploymentStatus && isStopAvailable(deploymentStatus.state)
  )

  const handleDeployAllServices = () => {
    openModal({
      content: (
        <ConfirmationModal
          verb="deploy"
          impactedRows={deployableServices}
          selectedRows={selectedRows}
          onSubmit={async () => {
            try {
              await deployAllServices({
                environment,
                payload: {
                  applications: deployableServices
                    .filter(({ serviceType }) => serviceType === 'APPLICATION')
                    .map(({ id }) => ({ application_id: id })),
                  containers: deployableServices
                    .filter(({ serviceType }) => serviceType === 'CONTAINER')
                    .map(({ id }) => ({ id })),
                  databases: deployableServices
                    .filter(({ serviceType }) => serviceType === 'DATABASE')
                    .map(({ id }) => id),
                  jobs: deployableServices.filter(({ serviceType }) => serviceType === 'JOB').map(({ id }) => ({ id })),
                  helms: deployableServices
                    .filter(({ serviceType }) => serviceType === 'HELM')
                    .map(({ id }) => ({ id })),
                },
              })
              resetRowSelection()
              closeModal()
            } catch (error) {
              console.error(error)
            }
          }}
          onCancel={closeModal}
        />
      ),
    })
  }

  const handleRestartAllServices = () =>
    openModal({
      content: (
        <ConfirmationModal
          verb="restart"
          impactedRows={restartableServices}
          selectedRows={selectedRows}
          onSubmit={async () => {
            try {
              await restartAllServices({
                environment,
                payload: {
                  application_ids: restartableServices
                    .filter(({ serviceType }) => serviceType === 'APPLICATION')
                    .map(({ id }) => id),
                  container_ids: restartableServices
                    .filter(({ serviceType }) => serviceType === 'CONTAINER')
                    .map(({ id }) => id),
                  database_ids: restartableServices
                    .filter(({ serviceType }) => serviceType === 'DATABASE')
                    .map(({ id }) => id),
                },
              })
              resetRowSelection()
              closeModal()
            } catch (error) {
              console.error(error)
            }
          }}
          onCancel={closeModal}
        />
      ),
    })

  const handleStopAllServices = () =>
    openModal({
      content: (
        <ConfirmationModal
          verb="stop"
          impactedRows={stoppableServices}
          selectedRows={selectedRows}
          onSubmit={async () => {
            try {
              await stopAllServices({
                environment,
                payload: {
                  application_ids: stoppableServices
                    .filter(({ serviceType }) => serviceType === 'APPLICATION')
                    .map(({ id }) => id),
                  container_ids: stoppableServices
                    .filter(({ serviceType }) => serviceType === 'CONTAINER')
                    .map(({ id }) => id),
                  database_ids: stoppableServices
                    .filter(({ serviceType }) => serviceType === 'DATABASE')
                    .map(({ id }) => id),
                  helm_ids: stoppableServices.filter(({ serviceType }) => serviceType === 'HELM').map(({ id }) => id),
                  job_ids: stoppableServices.filter(({ serviceType }) => serviceType === 'JOB').map(({ id }) => id),
                },
              })
              resetRowSelection()
              closeModal()
            } catch (error) {
              console.error(error)
            }
          }}
          onCancel={closeModal}
        />
      ),
    })

  const handleDeleteAllServices = () =>
    openModalConfirmation({
      title: `Delete ${deletableServices.length} ${pluralize(deletableServices.length, 'service')}`,
      name: 'these services',
      isDelete: true,
      action: async () => {
        try {
          await deleteAllServices({
            environment,
            payload: {
              application_ids: deletableServices
                .filter(({ serviceType }) => serviceType === 'APPLICATION')
                .map(({ id }) => id),
              container_ids: deletableServices
                .filter(({ serviceType }) => serviceType === 'CONTAINER')
                .map(({ id }) => id),
              database_ids: deletableServices
                .filter(({ serviceType }) => serviceType === 'DATABASE')
                .map(({ id }) => id),
              helm_ids: deletableServices.filter(({ serviceType }) => serviceType === 'HELM').map(({ id }) => id),
              job_ids: deletableServices.filter(({ serviceType }) => serviceType === 'JOB').map(({ id }) => id),
            },
          })
          resetRowSelection()
        } catch (error) {
          console.error(error)
        }
      },
    })

  return (
    <div className="sticky bottom-4">
      <div className="relative">
        <div
          className={twMerge(
            'absolute bottom-4 left-1/2 w-[448px] -translate-x-1/2',
            hasSelection ? '' : 'h-0 overflow-hidden'
          )}
        >
          <div
            className={twMerge(
              'flex h-[52px] items-center justify-between rounded bg-neutral-500 pl-5 pr-2 text-xs font-medium text-white shadow-xl',
              hasSelection ? 'animate-action-bar-fade-in' : 'animate-action-bar-fade-out'
            )}
          >
            <span>
              {selectedRows.length} selected {pluralize(selectedRows.length, 'service')}
            </span>
            <button className="h-8 px-3 underline" type="button" onClick={() => resetRowSelection()}>
              Deselect
            </button>
            <div className="flex gap-3">
              <Tooltip content="No deployable services" disabled={deployableServices.length !== 0}>
                <Button
                  color="brand"
                  size="md"
                  className="items-center gap-2"
                  onClick={() => handleDeployAllServices()}
                  disabled={deployableServices.length === 0}
                >
                  Deploy selected <Icon iconName="play" />
                </Button>
              </Tooltip>
              <DropdownMenu.Root modal={false}>
                <DropdownMenu.Trigger asChild>
                  <Button color="neutral" size="md" variant="surface" className="items-center gap-2">
                    More <Icon iconName="angle-down" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <Tooltip content="No restartable services" disabled={restartableServices.length !== 0}>
                    <DropdownMenu.Item
                      icon={<Icon iconName="rotate-right" />}
                      onSelect={handleRestartAllServices}
                      disabled={restartableServices.length === 0}
                    >
                      Restart selected
                    </DropdownMenu.Item>
                  </Tooltip>
                  <Tooltip content="No stoppable services" disabled={stoppableServices.length !== 0}>
                    <DropdownMenu.Item
                      icon={<Icon iconName="circle-stop" />}
                      onSelect={handleStopAllServices}
                      disabled={stoppableServices.length === 0}
                    >
                      Stop selected
                    </DropdownMenu.Item>
                  </Tooltip>
                  <DropdownMenu.Separator />
                  <Tooltip content="No deletable services" disabled={deletableServices.length !== 0}>
                    <DropdownMenu.Item
                      color="red"
                      icon={<Icon iconName="trash" />}
                      onSelect={handleDeleteAllServices}
                      disabled={deletableServices.length === 0}
                    >
                      Delete selected
                    </DropdownMenu.Item>
                  </Tooltip>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default ServiceListActionBar
