import clsx from 'clsx'
import { useState } from 'react'
import { Link, useMatch, useParams } from 'react-router-dom'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Button, DropdownMenu, Icon, InputSearch, Popover, StatusChip, Tooltip } from '@qovery/shared/ui'

export interface BreadcrumbDeploymentLogsProps {
  serviceId: string
}

export function BreadcrumbDeploymentLogs({ serviceId }: BreadcrumbDeploymentLogsProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  const matchDeploymentLogs = useMatch({
    path: ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_VERSION_URL(serviceId),
    end: false,
  })

  const [open, setOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  // const filteredVariables = variables.filter((variable) =>
  //   variable.key.toLowerCase().includes(searchTerm.toLowerCase())
  // )

  // XXX: https://github.com/radix-ui/primitives/issues/1342
  // We are waiting for radix combobox primitives
  // So we are using DropdownMenu.Root in combination of Popover.Root
  // to get the flexibility of Popover.Root but keeping the accessiblity of
  // DropdownMenu.Root for entries.
  // So both open state should be sync
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col">
        <span className="ml-2 text-xs font-medium text-neutral-350 dark:text-neutral-300">History</span>
        <div className="flex items-center gap-1">
          <DropdownMenu.Root open={open} onOpenChange={(open) => setOpen(open)}>
            <Popover.Root open={open} onOpenChange={(open) => setOpen(open)}>
              <Popover.Trigger>
                <span className="flex items-center">
                  <span>hello</span>
                  <Button type="button" variant="plain" radius="full">
                    <Icon iconName="angle-down" />
                  </Button>
                </span>
              </Popover.Trigger>
              <DropdownMenu.Content asChild>
                <Popover.Content className="flex max-h-60 w-[248px] min-w-[248px] flex-col p-2">
                  {/* 
                `stopPropagation` is used to prevent the event from `DropdownMenu.Root` parent
                fix issue with item focus if we use input search
                https://github.com/radix-ui/primitives/issues/2193#issuecomment-1790564604 
              */}
                  <div className="bg-white dark:bg-neutral-700" onKeyDown={(e) => e.stopPropagation()}>
                    <InputSearch
                      placeholder="Search..."
                      className="mb-1"
                      onChange={(value) => setSearchTerm(value)}
                      autofocus
                    />
                  </div>
                  <div className="overflow-y-auto">
                    {/* {filteredVariables.length > 0 ? (
                      filteredVariables.map((variable) => (
                        <Popover.Close key={variable.key} onClick={() => setSearchTerm('')}>
                          <DropdownMenu.Item
                            className={twMerge(
                              dropdownMenuItemVariants({ color: 'brand' }),
                              'flex h-[52px] items-center justify-between gap-1 px-2 py-1.5'
                            )}
                            onClick={() => onChange(variable.key)}
                          >
                            <div className="flex flex-col items-start justify-center gap-1">hello</div>
                          </DropdownMenu.Item>
                        </Popover.Close>
                      ))
                    ) : (
                      <div className="px-3 py-6 text-center">
                        <Icon iconName="wave-pulse" className="text-neutral-350" />
                        <p className="mt-1 text-xs font-medium text-neutral-350">No result for this search</p>
                      </div>
                    )} */}
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
