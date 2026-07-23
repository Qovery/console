import { useNavigate } from '@tanstack/react-router'
import { type BlueprintUpdateResponse } from 'qovery-typescript-axios'
import { type AnyService } from '@qovery/domains/services/data-access'
import { Badge, Icon, useModal } from '@qovery/shared/ui'
import { BlueprintUpdateNoInputConfirmationModal } from './blueprint-update-no-input-confirmation-modal'
import { getBlueprintUpdateTitle, hasBlueprintUpdateReviewSections } from './blueprint-update-utils'

export interface BlueprintUpdateBadgeProps {
  blueprintUpdate: BlueprintUpdateResponse
  organizationId: string
  projectId: string
  service: AnyService
}

export function BlueprintUpdateBadge({
  blueprintUpdate,
  organizationId,
  projectId,
  service,
}: BlueprintUpdateBadgeProps) {
  const navigate = useNavigate()
  const { openModal } = useModal()

  const openUpdateFlow = (step?: 'preview') => {
    navigate({
      to:
        step === 'preview'
          ? '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/update/blueprint/preview'
          : '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/update/blueprint',
      params: { organizationId, projectId, environmentId: service.environment.id, serviceId: service.id },
    })
  }

  if (blueprintUpdate.is_up_to_date) {
    return (
      <Badge variant="surface" color="neutral" className="cursor-default gap-1 whitespace-nowrap font-medium">
        <Icon className="h-3 w-3" iconName="circle-check" iconStyle="regular" />
        Up to date
      </Badge>
    )
  }

  return (
    <button
      type="button"
      className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      onClick={() => {
        if (hasBlueprintUpdateReviewSections(blueprintUpdate)) {
          openUpdateFlow()
          return
        }

        openModal({
          content: (
            <BlueprintUpdateNoInputConfirmationModal
              title={getBlueprintUpdateTitle({
                serviceName: service.name,
                currentTag: blueprintUpdate.current_tag,
                latestTag: blueprintUpdate.latest_tag,
              })}
              onConfirm={() => openUpdateFlow('preview')}
            />
          ),
        })
      }}
    >
      <Badge variant="surface" color="sky" className="gap-1 whitespace-nowrap font-medium">
        <Icon className="h-3 w-3" iconName="arrow-rotate-right" iconStyle="regular" />
        Update available
      </Badge>
    </button>
  )
}
