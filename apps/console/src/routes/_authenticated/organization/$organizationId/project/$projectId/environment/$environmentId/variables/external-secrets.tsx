import { createFileRoute } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { useEffect } from 'react'
import { useDeployEnvironment } from '@qovery/domains/environments/feature'
import { ExternalSecretsTab, SecretManagerFeatureFlagEntryPoint } from '@qovery/domains/variables/feature'
import { ENVIRONMENT_LOGS_URL, ENVIRONMENT_STAGES_URL } from '@qovery/shared/routes'
import { toast } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/variables/external-secrets'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, projectId, environmentId } = Route.useParams()
  const secretManagerEnabled = useFeatureFlagEnabled('secret-manager')
  useDocumentTitle('External secrets - Environment')

  useEffect(() => {
    posthog.capture('external-secrets-tab-accessed', {
      scope: 'environment',
      organization_id: organizationId,
      project_id: projectId,
      environment_id: environmentId,
    })
  }, [organizationId, projectId, environmentId])

  const { mutate: deployEnvironment } = useDeployEnvironment({
    projectId,
    logsLink: ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + ENVIRONMENT_STAGES_URL(),
  })

  const redeployEnvironmentAction = () => {
    deployEnvironment({ environmentId })
  }

  const onCreateSecret = () =>
    toast(
      'success',
      'Creation success',
      'You need to redeploy your environment for your changes to be applied.',
      redeployEnvironmentAction,
      'Redeploy'
    )

  const onEditSecret = () =>
    toast(
      'success',
      'Edition success',
      'You need to redeploy your environment for your changes to be applied.',
      redeployEnvironmentAction,
      'Redeploy'
    )

  const onDeleteSecret = () =>
    toast(
      'success',
      'Deletion success',
      'You need to redeploy your environment for your changes to be applied.',
      redeployEnvironmentAction,
      'Redeploy'
    )

  if (!secretManagerEnabled) {
    return <SecretManagerFeatureFlagEntryPoint />
  }

  return (
    <ExternalSecretsTab
      scope="ENVIRONMENT"
      parentId={environmentId}
      onCreateSecret={onCreateSecret}
      onEditSecret={onEditSecret}
      onDeleteSecret={onDeleteSecret}
    />
  )
}
