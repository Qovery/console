import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AnnotationSetting, LabelSetting } from '@qovery/domains/organizations/feature'
import { HelmStepGeneral } from '@qovery/domains/service-helm/feature'
import { serviceCreateParamsSchema } from '@qovery/shared/router'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/helm/general'
)({
  component: General,
  validateSearch: serviceCreateParamsSchema,
})

function General() {
  const { organizationId = '', projectId = '', environmentId = '' } = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate()
  const creationFlowUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/helm`

  useDocumentTitle('General - Create Helm')

  return (
    <HelmStepGeneral
      onSubmit={() => navigate({ to: `${creationFlowUrl}/values-override-file`, search })}
      labelSetting={<LabelSetting />}
      annotationSetting={<AnnotationSetting />}
    />
  )
}
