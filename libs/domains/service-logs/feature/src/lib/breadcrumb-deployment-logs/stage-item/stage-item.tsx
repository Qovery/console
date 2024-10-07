import * as Collapsible from '@radix-ui/react-collapsible'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { type Stage, type Status } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { type AnyService } from '@qovery/domains/services/data-access'
import { ServiceAvatar } from '@qovery/domains/services/feature'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { BadgeDeploymentOrder, Icon, StatusChip, Truncate, dropdownMenuItemVariants } from '@qovery/shared/ui'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface StageItemProps {
  stage: {
    mergedServices: Status[]
    stage?: Stage
  }
  index: number
  versionId: string
  searchTerm: string
  getService: (serviceId: string) => AnyService | undefined
}

export function StageItem({ stage, index, getService, versionId, searchTerm }: StageItemProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const [isOpen, setIsOpen] = useState(() => {
    // Initialize open state based on whether there are any non-skipped services
    return stage.mergedServices.some((service) => service.steps?.total_duration_sec !== undefined)
  })

  useEffect(() => {
    if (searchTerm.length > 0) setIsOpen(true)
  }, [searchTerm])

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen} asChild>
      <div className="mb-2 last:mb-0">
        <Collapsible.Trigger className="w-full" asChild>
          <button className="flex items-center justify-between pb-2 pr-2 pt-1 text-sm text-neutral-250">
            <span className="flex items-center">
              <BadgeDeploymentOrder className="mr-1.5" order={index + 1} />
              <Truncate text={upperCaseFirstLetter(stage.stage?.name)} truncateLimit={40} />
            </span>
            <Icon iconName={isOpen ? 'chevron-up' : 'chevron-down'} />
          </button>
        </Collapsible.Trigger>
        <Collapsible.Content>
          {stage.mergedServices.map((service) => {
            const fullService = getService(service.id)
            const totalDurationSec = service.steps?.total_duration_sec
            return (
              <DropdownMenu.Item
                key={service.id}
                className={twMerge(
                  dropdownMenuItemVariants({ color: 'brand' }),
                  'w-full justify-between gap-1 px-2 py-1.5'
                )}
                asChild
              >
                <Link
                  to={
                    ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
                    DEPLOYMENT_LOGS_VERSION_URL(service.id, versionId)
                  }
                >
                  <span className="flex items-center gap-2.5">
                    <ServiceAvatar size="xs" service={getService(service.id)!} border="none" />
                    <Truncate text={fullService?.name ?? ''} truncateLimit={28} />
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-neutral-300">
                      {totalDurationSec ? (
                        <span>
                          {Math.floor(totalDurationSec / 60)}m:{totalDurationSec % 60}s
                        </span>
                      ) : (
                        'skipped'
                      )}
                    </span>
                    <StatusChip status={totalDurationSec ? service.state : 'SKIP'} />
                  </span>
                </Link>
              </DropdownMenu.Item>
            )
          })}
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  )
}

export default StageItem
