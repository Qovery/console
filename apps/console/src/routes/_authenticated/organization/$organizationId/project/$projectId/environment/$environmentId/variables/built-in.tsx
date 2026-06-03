import { createFileRoute } from '@tanstack/react-router'
import { useDeployEnvironment } from '@qovery/domains/environments/feature'
import { VariableList } from '@qovery/domains/variables/feature'
import { ENVIRONMENT_LOGS_URL, ENVIRONMENT_STAGES_URL } from '@qovery/shared/routes'
import { toast } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/variables/built-in'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, projectId, environmentId } = Route.useParams()
  useDocumentTitle('Built-in variables - Environment')

  const { mutate: deployEnvironment } = useDeployEnvironment({
    projectId,
    logsLink: ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + ENVIRONMENT_STAGES_URL(),
  })

  const toasterCallback = () => {
    deployEnvironment({ environmentId })
  }

  const onCreateVariableToast = () =>
    toast(
      'success',
      'Creation success',
      'You need to redeploy your environment for your changes to be applied.',
      toasterCallback,
      'Redeploy'
    )

  const onEditVariableToast = () =>
    toast(
      'success',
      'Edition success',
      'You need to redeploy your environment for your changes to be applied.',
      toasterCallback,
      'Redeploy'
    )

  const onDeleteVariableToast = () => {
    toast(
      'success',
      'Deletion success',
      'Your variable has been deleted. You need to redeploy your environment for your changes to be applied.',
      toasterCallback,
      'Redeploy'
    )
  }

  return (
    <VariableList
      showOnly="built-in"
      hideSectionLabel
      headerActions={<div className="hidden" />}
      scope="ENVIRONMENT"
      organizationId={organizationId}
      projectId={projectId}
      environmentId={environmentId}
      onCreateVariable={onCreateVariableToast}
      onEditVariable={onEditVariableToast}
      onDeleteVariable={onDeleteVariableToast}
    />
  )
}
