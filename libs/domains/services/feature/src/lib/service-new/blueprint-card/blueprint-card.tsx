import { useParams } from '@tanstack/react-router'
import { type BlueprintItem } from 'qovery-typescript-axios'
import { type Gate, PaywallLock } from '@qovery/shared/billing-kit'
import { Button, Heading, Link } from '@qovery/shared/ui'
import { getBlueprintDisplayName } from '../../blueprint-utils/blueprint-utils'
import { ServiceAvatar } from '../../service-avatar/service-avatar'

/** The plan does not include blueprints: the catalog stays browsable, opening a blueprint opens the paywall. */
export type BlueprintLock = { gate: Gate; open: () => void }

export function BlueprintCard({
  blueprint,
  onViewDetails,
  lock,
}: {
  blueprint: BlueprintItem
  onViewDetails: (blueprint: BlueprintItem) => void
  lock?: BlueprintLock
}) {
  const { environmentId = '', organizationId = '', projectId = '' } = useParams({ strict: false })

  return (
    <section className="flex h-full flex-col gap-4 rounded-lg border border-neutral bg-surface-neutral p-4 [box-shadow:0px_0px_4px_0px_rgba(0,0,0,0.01),0px_2px_3px_0px_rgba(0,0,0,0.02)]">
      <div className="flex flex-1 flex-col gap-3">
        <ServiceAvatar
          className="h-9 w-9"
          radius="none"
          service={{ icon_uri: blueprint.icon, serviceType: 'APPLICATION' }}
          serviceAvatarRadius="sm"
          size="custom"
        />
        <div className="flex flex-col gap-1">
          <Heading level={4} className="text-sm">
            {getBlueprintDisplayName(blueprint)}
          </Heading>
          <p className="text-xs leading-5 text-neutral-subtle">{blueprint.description}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center gap-1">
        {blueprint.serviceFamily && lock && (
          <Button type="button" variant="outline" color="neutral" size="sm" onClick={lock.open}>
            Deploy
          </Button>
        )}
        {blueprint.serviceFamily && !lock && (
          <Link
            to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/blueprint/$provider/$serviceFamily"
            params={{
              organizationId,
              projectId,
              environmentId,
              provider: blueprint.provider,
              serviceFamily: blueprint.serviceFamily,
            }}
            as="button"
            variant="outline"
            color="neutral"
            size="sm"
          >
            Deploy
          </Link>
        )}
        <Button type="button" variant="plain" color="neutral" size="sm" onClick={() => onViewDetails(blueprint)}>
          View details
        </Button>
        {lock && <PaywallLock gate={lock.gate} onClick={lock.open} className="ml-auto" />}
      </div>
    </section>
  )
}
