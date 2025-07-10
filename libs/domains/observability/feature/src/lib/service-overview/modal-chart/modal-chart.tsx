import * as Dialog from '@radix-ui/react-dialog'
import { type PropsWithChildren } from 'react'
import { Button, Checkbox, Heading, Icon, InputSelectSmall, Section } from '@qovery/shared/ui'
import { SelectTimeRange } from '../select-time-range/select-time-range'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

interface ModalChartProps extends PropsWithChildren {
  title: string
  description?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModalChart({ children, open, onOpenChange, title, description }: ModalChartProps) {
  const { useLocalTime, setUseLocalTime, hideEvents, setHideEvents } = useServiceOverviewContext()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="modal__overlay fixed left-0 top-0 flex h-full w-full bg-neutral-700/20"
          onClick={() => onOpenChange(false)}
        />
        <Dialog.Content className="modal__content fixed left-1/2 top-6 h-[calc(100vh-48px)] w-[calc(100vw-48px)] rounded-md bg-white shadow-[0_0_32px_rgba(0,0,0,0.08)]">
          <Section>
            <div className="flex h-14 w-full items-center justify-between gap-5 border-b border-neutral-200 px-5">
              <div className="flex items-baseline gap-2">
                {title && (
                  <Dialog.Title>
                    <Heading>{title}</Heading>
                  </Dialog.Title>
                )}
                {description && <p className="text-xs text-neutral-350">{description}</p>}
              </div>
              <div className="flex items-center gap-10">
                <div className="flex items-center gap-5">
                  <SelectTimeRange />
                  <InputSelectSmall
                    name="timezone"
                    className="w-[120px]"
                    items={[
                      { label: 'Local Time', value: 'local' },
                      { label: 'UTC', value: 'utc' },
                    ]}
                    defaultValue={useLocalTime ? 'local' : 'utc'}
                    onChange={(e) => setUseLocalTime(e === 'local')}
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="hide-events"
                      name="hide-events"
                      className="h-4 w-4 min-w-4"
                      checked={hideEvents}
                      onCheckedChange={(checked) => setHideEvents(checked as boolean)}
                    />
                    <label htmlFor="hide-events" className="text-sm text-neutral-400">
                      Hide events
                    </label>
                  </div>
                </div>
                <Dialog.Close>
                  <Button variant="outline" size="md">
                    <Icon iconName="xmark" />
                  </Button>
                </Dialog.Close>
              </div>
            </div>
            <div className="h-[calc(100vh-48px-56px)]">{children}</div>
          </Section>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ModalChart
