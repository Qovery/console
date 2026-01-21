import type { ScaledObjectStatusDto } from 'qovery-ws-typescript-axios/dist/api'
import { match } from 'ts-pattern'
import { Badge, Heading, Icon, Section, Skeleton, StatusChip } from '@qovery/shared/ui'
import { useRunningStatus } from '../../hooks/use-running-status/use-running-status'

export interface ScaledObjectStatusProps {
  environmentId: string
  serviceId: string
}

export function ScaledObjectStatus({ environmentId, serviceId }: ScaledObjectStatusProps) {
  const { data: runningStatus, isLoading } = useRunningStatus({ environmentId, serviceId })

  // Only show for APPLICATION and CONTAINER with scaled_object
  if (!runningStatus || !('scaled_object' in runningStatus) || !runningStatus.scaled_object) {
    return null
  }

  const scaledObject = runningStatus.scaled_object as ScaledObjectStatusDto

  if (isLoading) {
    return (
      <Section className="gap-3">
        <Heading>Scaled Object</Heading>
        <Skeleton height={80} width="100%" />
      </Section>
    )
  }

  return (
    <Section className="gap-3">
      <Heading>Scaled Object (KEDA)</Heading>
      <div className="rounded border border-neutral-250 bg-neutral-100">
        <div className="border-b border-neutral-250 px-4 py-3">
          <div className="flex items-center gap-3">
            <Icon iconName="gauge-high" className="text-neutral-400" />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-neutral-400">{scaledObject.name}</span>
            </div>
          </div>
        </div>

        {scaledObject.conditions && scaledObject.conditions.length > 0 && (
          <div className="divide-y divide-neutral-250">
            {scaledObject.conditions
              .filter((condition) => {
                // Don't show Fallback at all
                if (condition.type === 'Fallback') return false
                // Only show Paused if it's True (paused)
                if (condition.type === 'Paused' && condition.status !== 'True') return false
                // Only show Active if it's True (if False, all scalers have correct values, not an issue)
                return !(condition.type === 'Active' && condition.status !== 'True')
              })
              .map((condition, index) => {
                const chipStatus = match({ type: condition.type, status: condition.status })
                  // Positive conditions: True = good, False = bad/warning
                  .with({ type: 'Ready', status: 'True' }, () => 'RUNNING' as const)
                  .with({ type: 'Ready', status: 'False' }, () => 'ERROR' as const)
                  .with({ type: 'Active', status: 'True' }, () => 'RUNNING' as const)
                  .with({ type: 'Active', status: 'False' }, () => 'WARNING' as const)
                  // Paused: True = bad (paused)
                  .with({ type: 'Paused', status: 'True' }, () => 'ERROR' as const)
                  // Default
                  .otherwise(() => (condition.status === 'True' ? ('RUNNING' as const) : ('WARNING' as const)))

                return (
                  <div key={index} className="flex items-start gap-3 px-4 py-3">
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-400">{condition.type}</span>
                        <Badge variant="outline" radius="full" className="gap-2">
                          <StatusChip status={chipStatus} />
                          <span className="text-neutral-400">{condition.status}</span>
                        </Badge>
                      </div>
                      {condition.reason && <span className="text-xs text-neutral-350">Reason: {condition.reason}</span>}
                      {condition.message && <span className="text-xs text-neutral-350">{condition.message}</span>}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </Section>
  )
}
