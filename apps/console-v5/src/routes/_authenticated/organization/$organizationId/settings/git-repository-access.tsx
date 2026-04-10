import { createFileRoute } from '@tanstack/react-router'
import { SettingsGitRepositoryAccess } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/git-repository-access')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsGitRepositoryAccess />
}
