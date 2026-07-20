import { useParams } from '@tanstack/react-router'
import { type BlueprintItem } from 'qovery-typescript-axios'
import { Button, Link } from '@qovery/shared/ui'
import { formatBlueprintName } from '../../blueprint-utils/blueprint-utils'
import { ServiceAvatar } from '../../service-avatar/service-avatar'

export function BlueprintCard({
  blueprint,
  onViewDetails,
}: {
  blueprint: BlueprintItem
  onViewDetails: (blueprint: BlueprintItem) => void
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
          <h3 className="text-sm font-medium leading-5 text-neutral">{formatBlueprintName(blueprint.name)}</h3>
          <p className="text-sm leading-5 text-neutral-subtle">{blueprint.description}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center gap-1">
        {blueprint.serviceFamily && (
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
      </div>
    </section>
  )
}
