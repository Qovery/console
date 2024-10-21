import { type CheckedState } from '@radix-ui/react-checkbox'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { type DeploymentStageWithServicesStatuses, type Status } from 'qovery-typescript-axios'
import { useMemo, useState } from 'react'
import { type AnyService } from '@qovery/domains/services/data-access'
import { BadgeDeploymentOrder, Button, Checkbox, Icon, InputSearch, Popover } from '@qovery/shared/ui'
import { StageItem } from './stage-item/stage-item'

export function mergeServices(
  applications?: Status[],
  databases?: Status[],
  containers?: Status[],
  jobs?: Status[],
  helms?: Status[]
) {
  return (
    (applications &&
      databases &&
      containers &&
      jobs &&
      helms && [...applications, ...databases, ...containers, ...jobs, ...helms]) ||
    []
  )
}
export interface BreadcrumbDeploymentLogsProps {
  serviceId: string
  versionId: string
  services: AnyService[]
  statusStages: DeploymentStageWithServicesStatuses[]
}

export function BreadcrumbDeploymentLogs({
  serviceId,
  versionId,
  services,
  statusStages,
}: BreadcrumbDeploymentLogsProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [hideSkipped, setHideSkipped] = useState<CheckedState>(true)

  const getService = (serviceId: string) => services.find((service: AnyService) => service.id === serviceId)
  const currentService = getService(serviceId)

  const findStageIndex = (serviceId: string): number => {
    for (let i = 0; i < statusStages.length; i++) {
      const stage = statusStages[i]
      const mergedServices = mergeServices(
        stage.applications,
        stage.databases,
        stage.containers,
        stage.jobs,
        stage.helms
      )
      if (mergedServices.some((service) => service.id === serviceId)) {
        return i + 1
      }
    }
    return -1
  }

  const currentFindStageIndex = findStageIndex(serviceId)

  const stagesWithMergedServices = useMemo(
    () =>
      statusStages.map((stage) => ({
        ...stage,
        mergedServices: mergeServices(stage.applications, stage.databases, stage.containers, stage.jobs, stage.helms),
      })),
    [statusStages]
  )

  const filteredStages = useMemo(
    () =>
      stagesWithMergedServices
        .map((stage) => ({
          ...stage,
          mergedServices: stage.mergedServices.filter((service) => {
            const fullService = getService(service.id)
            return fullService?.name.toLowerCase().includes(searchTerm.toLowerCase())
          }),
        }))
        .filter((stage) => stage.mergedServices.length > 0),
    [stagesWithMergedServices, searchTerm, services]
  )

  // XXX: https://github.com/radix-ui/primitives/issues/1342
  // We are waiting for radix combobox primitives
  // So we are using DropdownMenu.Root in combination of Popover.Root
  // to get the flexibility of Popover.Root but keeping the accessiblity of
  // DropdownMenu.Root for entries.
  // So both open state should be sync
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col">
        <span className="ml-2 text-xs font-medium text-neutral-350 dark:text-neutral-300">Deployment logs</span>
        <div className="flex items-center gap-1">
          <DropdownMenu.Root open={open} onOpenChange={(open) => setOpen(open)}>
            <Popover.Root open={open} onOpenChange={(open) => setOpen(open)}>
              <span className="flex items-center justify-between pl-2">
                <BadgeDeploymentOrder className="mr-1.5" order={currentFindStageIndex} />
                <span className="mr-3 text-sm font-medium text-neutral-50">{currentService?.name}</span>
                <Popover.Trigger>
                  <Button type="button" variant="plain" radius="full">
                    <Icon iconName="angle-down" />
                  </Button>
                </Popover.Trigger>
              </span>
              <DropdownMenu.Content asChild>
                <Popover.Content className="-ml-2.5 flex min-w-96 flex-col gap-3 rounded-md border-transparent bg-neutral-700 p-3 shadow-[0_0_32px_rgba(0,0,0,0.08)] data-[state=open]:data-[side=bottom]:animate-slidein-up-md-faded data-[state=open]:data-[side=left]:animate-slidein-right-sm-faded data-[state=open]:data-[side=right]:animate-slidein-left-md-faded data-[state=open]:data-[side=top]:animate-slidein-down-md-faded">
                  {/* 
                    `stopPropagation` is used to prevent the event from `DropdownMenu.Root` parent
                    fix issue with item focus if we use input search
                    https://github.com/radix-ui/primitives/issues/2193#issuecomment-1790564604 
                  */}
                  <div className="flex flex-col gap-3" onKeyDown={(e) => e.stopPropagation()}>
                    <InputSearch
                      placeholder="Search..."
                      className="mb-1 dark:bg-neutral-600"
                      onChange={(value) => setSearchTerm(value)}
                      autofocus
                    />
                    <div className="flex items-center gap-3 text-sm font-medium text-neutral-50">
                      <Checkbox
                        name="skipped"
                        id="skipped"
                        className="shrink-0"
                        color="brand"
                        checked={hideSkipped}
                        onCheckedChange={setHideSkipped}
                      />
                      <label htmlFor="skipped">Hide skipped</label>
                    </div>
                  </div>
                  <div className="overflow-y-auto">
                    {filteredStages.length > 0 ? (
                      filteredStages.map((stage, index) => (
                        <StageItem
                          key={index}
                          stage={stage}
                          index={index}
                          getService={getService}
                          serviceId={serviceId}
                          versionId={versionId}
                          searchTerm={searchTerm}
                          hideSkipped={hideSkipped}
                        />
                      ))
                    ) : (
                      <div className="px-3 py-6 text-center">
                        <Icon iconName="wave-pulse" className="text-neutral-350" />
                        <p className="mt-1 text-xs font-medium text-neutral-350">No result for this search</p>
                      </div>
                    )}
                  </div>
                </Popover.Content>
              </DropdownMenu.Content>
            </Popover.Root>
          </DropdownMenu.Root>
        </div>
      </div>
    </div>
  )
}

export default BreadcrumbDeploymentLogs
