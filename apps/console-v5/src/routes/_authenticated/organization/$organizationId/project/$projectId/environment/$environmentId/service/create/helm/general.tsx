import { createFileRoute } from '@tanstack/react-router'
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
  useDocumentTitle('General - Create Helm')

  return <HelmStepGeneral labelSetting={<LabelSetting />} annotationSetting={<AnnotationSetting />} />
}
