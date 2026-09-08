import { createFileRoute } from '@tanstack/react-router'
import { PageSettingsPreviewEnvironmentsFeature } from '@qovery/domains/environments/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/automations/settings/preview-environments'
)({ component: PageSettingsPreviewEnvironmentsFeature })
