import { match } from 'ts-pattern'
import { Badge, BlockContent, StatusChip } from '@qovery/shared/ui'

interface ScaledObjectCondition {
  type: string
  status: string
  message?: string
  reason?: string
}

export interface ScaledObjectStatusDto {
  name: string
  conditions?: ScaledObjectCondition[]
}

export interface ScaledObjectStatusProps {
  scaledObject: ScaledObjectStatusDto
}

export function ScaledObjectStatus({ scaledObject }: ScaledObjectStatusProps) {
  return (
    <BlockContent title={scaledObject.name} className="mb-0" classNameContent="p-0">
      {scaledObject.conditions && scaledObject.conditions.length > 0 && (
        <div className="divide-y divide-neutral">
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
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral">{condition.type}</span>
                      <Badge variant="outline" radius="full" className="gap-2">
                        <StatusChip status={chipStatus} />
                        <span className="text-neutral">{condition.status}</span>
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1">
                      {condition.reason && <span className="text-xs text-neutral">Reason: {condition.reason}</span>}
                      {condition.message && <span className="text-xs text-neutral">{condition.message}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </BlockContent>
  )
}
