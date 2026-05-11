import { createFileRoute } from '@tanstack/react-router'
import { useAnnotationsGroups, useLabelsGroups } from '@qovery/domains/organizations/feature'
import { DatabaseStepSummary } from '@qovery/domains/services/feature'
import { serviceCreateParamsSchema } from '@qovery/shared/router'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/database/summary'
)({
  component: Summary,
  validateSearch: serviceCreateParamsSchema,
})

function Summary() {
  const { organizationId = '' } = Route.useParams()
  const { data: labelsGroup = [] } = useLabelsGroups({ organizationId })
  const { data: annotationsGroup = [] } = useAnnotationsGroups({ organizationId })

  useDocumentTitle('Summary - Create Database')

  return <DatabaseStepSummary labelsGroup={labelsGroup} annotationsGroup={annotationsGroup} />
}
