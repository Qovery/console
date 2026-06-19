import { type BlueprintItem } from 'qovery-typescript-axios'
import { Button, Link } from '@qovery/shared/ui'

export function BlueprintCard({
  blueprint,
  deployPath,
  onViewDetails,
}: {
  blueprint: BlueprintItem
  deployPath: string
  onViewDetails: (blueprint: BlueprintItem) => void
}) {
  return (
    <section className="flex h-full flex-col gap-4 rounded-lg border border-neutral bg-surface-neutral p-4 [box-shadow:0px_0px_4px_0px_rgba(0,0,0,0.01),0px_2px_3px_0px_rgba(0,0,0,0.02)]">
      <div className="flex flex-1 flex-col gap-3">
        <img className="h-9 w-9 rounded" src={blueprint.icon} alt={blueprint.name} aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium leading-5 text-neutral">{blueprint.name}</h3>
          <p className="text-sm leading-5 text-neutral-subtle">{blueprint.description}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center gap-1">
        <Link
          // @ts-expect-error-next-line TODO new-nav : Route strings need to be updated using the next typed routes
          to={deployPath}
          as="button"
          variant="outline"
          color="neutral"
          size="sm"
        >
          Deploy
        </Link>
        <Button type="button" variant="plain" color="neutral" size="sm" onClick={() => onViewDetails(blueprint)}>
          View details
        </Button>
      </div>
    </section>
  )
}
