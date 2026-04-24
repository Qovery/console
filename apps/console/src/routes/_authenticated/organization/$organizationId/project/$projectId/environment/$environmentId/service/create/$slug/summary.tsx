import { createFileRoute } from '@tanstack/react-router'
import { useAnnotationsGroups, useContainerRegistry, useLabelsGroups } from '@qovery/domains/organizations/feature'
import { ApplicationContainerStepSummary, useApplicationContainerCreateContext } from '@qovery/domains/services/feature'
import { serviceCreateParamsSchema } from '@qovery/shared/router'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/$slug/summary'
)({
  component: Summary,
  validateSearch: serviceCreateParamsSchema,
})

function Summary() {
  const { organizationId = '' } = Route.useParams()
  const { generalForm } = useApplicationContainerCreateContext()
  const registryId = generalForm.watch('registry')

  const { data: containerRegistry } = useContainerRegistry({
    organizationId,
    containerRegistryId: registryId,
  })
  const { data: annotationsGroup = [] } = useAnnotationsGroups({ organizationId })
  const { data: labelsGroup = [] } = useLabelsGroups({ organizationId })

  useDocumentTitle('Summary - Create Service')

  return (
    <ApplicationContainerStepSummary
      selectedRegistryName={containerRegistry?.name}
      annotationsGroup={annotationsGroup}
      labelsGroup={labelsGroup}
    />
  )
}
