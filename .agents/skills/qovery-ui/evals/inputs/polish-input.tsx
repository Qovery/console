// Synthetic test input for /polish eval — no deprecations, just refinement opportunities.
import { Button } from '@qovery/shared/ui'

interface EnvironmentCardProps {
  name: string
  description: string
  serviceCount: number
  onSelect: () => void
}

export function EnvironmentCard({ name, description, serviceCount, onSelect }: EnvironmentCardProps) {
  return (
    <div
      onClick={onSelect}
      className="flex flex-col gap-3 p-5 rounded-lg border border-neutral bg-white cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-700">{name}</h3>
        <span className="text-xs text-neutral-600">{serviceCount} services</span>
      </div>
      <p className="text-xs text-neutral-500">{description}</p>
      <div className="flex gap-3 mt-2">
        <Button variant="surface" color="neutral" size="sm">
          View
        </Button>
        <Button variant="outline" color="neutral" size="sm">
          Deploy
        </Button>
      </div>
    </div>
  )
}
