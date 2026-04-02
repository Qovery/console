import { createFileRoute } from '@tanstack/react-router'
import { SettingsArgoCdIntegration, type SettingsArgoCdIntegrationUseCase } from '@qovery/domains/organizations/feature'
import { useUseCasePage } from '../../../../../app/components/use-cases/use-case-context'

const PAGE_ID = 'org-settings-argocd-integration'
const USE_CASE_OPTIONS: { id: SettingsArgoCdIntegrationUseCase; label: string }[] = [
  { id: 'empty-state', label: 'Empty state' },
  { id: 'loading-integration', label: 'Importing' },
  { id: 'loaded', label: 'Loaded' },
  { id: 'loaded-single-cluster', label: 'Loaded (1 cluster)' },
]

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/argocd-integration')({
  component: RouteComponent,
})

function RouteComponent() {
  const { selectedCaseId } = useUseCasePage({
    pageId: PAGE_ID,
    options: USE_CASE_OPTIONS,
    defaultCaseId: 'empty-state',
  })

  return <SettingsArgoCdIntegration useCaseId={selectedCaseId as SettingsArgoCdIntegrationUseCase} />
}
