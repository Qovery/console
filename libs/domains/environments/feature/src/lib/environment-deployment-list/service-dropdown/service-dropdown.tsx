import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import { type DeploymentHistoryStage } from 'qovery-typescript-axios'
import { useMemo, useState } from 'react'
import { Popover, StageStatusChip } from '@qovery/shared/ui'
import { formatDuration } from '@qovery/shared/util-dates'

export interface ServiceDropdownProps {
  stages: DeploymentHistoryStage[]
}

const filterStagesWithServices = (stages: DeploymentHistoryStage[]) =>
  stages.filter((stage) => stage.services && stage.services.length > 0)

export function ServiceDropdown({ stages }: ServiceDropdownProps) {
  const [open, setOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const filteredStages = filterStagesWithServices(stages)

  return (
    <MotionConfig transition={{ duration: 0.5, type: 'spring', bounce: 0 }}>
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger onMouseOver={() => setOpen(true)}>
            <div className="flex">
              {stages.map((v) => {
                return (
                  <span
                    className="flex items-center after:block after:h-[1px] after:w-0.5 after:bg-neutral-250 after:content-[''] last:after:hidden"
                    onMouseLeave={() => {
                      setCurrentIndex(0)
                    }}
                  >
                    <StageStatusChip status={v.status} />
                  </span>
                )
              })}
            </div>
          </Popover.Trigger>
          <DropdownMenu.Content asChild>
            <Popover.Content className="p-2">
              {filteredStages.map((stage, index) => (
                <AnimatePresence mode="popLayout" initial={false}>
                  <div key={index} className="w-56 rounded-t border border-neutral-200">
                    <div className="flex h-[54px] items-center gap-4 border-b border-neutral-200 bg-neutral-100 px-2 py-2.5">
                      <StageStatusChip status={stage.status} />
                      <div className="flex flex-col text-neutral-400">
                        <span className="text-ssm font-medium">{stage.name}</span>
                        <span className="text-[11px]">{formatDuration(stage.duration)}</span>
                      </div>
                    </div>
                    {stage.services.map((service, index) => (
                      <DropdownMenu.Item key={index} className="h-[50px]">
                        {service.identifier.name}
                      </DropdownMenu.Item>
                    ))}
                  </div>
                </AnimatePresence>
              ))}
            </Popover.Content>
          </DropdownMenu.Content>
        </Popover.Root>
      </DropdownMenu.Root>
    </MotionConfig>
  )
}

export default ServiceDropdown
