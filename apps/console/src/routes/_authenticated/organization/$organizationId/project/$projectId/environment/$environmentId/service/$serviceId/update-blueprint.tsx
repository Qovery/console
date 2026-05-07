import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  BlueprintUpdateReview,
  MOCK_ADDED_FIELDS,
  MOCK_BLUEPRINTS,
  MOCK_CHANGED_FIELDS,
  MOCK_REMOVED_FIELDS,
  MOCK_REQUIRED_INPUTS,
} from '@qovery/domains/services/feature'

interface BlueprintUpdateSearch {
  targetVersion?: string
  from?: 'overview' | 'settings'
}

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/update-blueprint'
)({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): BlueprintUpdateSearch => ({
    targetVersion: typeof search.targetVersion === 'string' ? search.targetVersion : undefined,
    from: search.from === 'settings' ? 'settings' : 'overview',
  }),
})

function RouteComponent() {
  const navigate = useNavigate()
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = Route.useParams()
  const { targetVersion = '2.1', from = 'overview' } = Route.useSearch()

  const blueprint = MOCK_BLUEPRINTS[0]

  if (!blueprint) {
    return (
      <Navigate
        to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview"
        params={{ organizationId, projectId, environmentId, serviceId }}
        replace
      />
    )
  }

  const goBack = () => {
    navigate({
      to:
        from === 'settings'
          ? '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/general'
          : '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview',
      params: { organizationId, projectId, environmentId, serviceId },
    })
  }

  return (
    <BlueprintUpdateReview
      blueprintName={blueprint.name}
      currentVersion={blueprint.versions[1]?.version ?? '2.0'}
      targetVersion={targetVersion}
      releaseNotesUrl={blueprint.repositoryUrl}
      requiredInputs={MOCK_REQUIRED_INPUTS}
      changedFields={MOCK_CHANGED_FIELDS}
      addedFields={MOCK_ADDED_FIELDS}
      removedFields={MOCK_REMOVED_FIELDS}
      onBack={goBack}
      onDeploy={goBack}
      onDeployWithPreview={goBack}
    />
  )
}
