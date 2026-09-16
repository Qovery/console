import { Outlet, createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { useEffect } from 'react'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/agents')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const isAgenticWorkflowEnabled = Boolean(useFeatureFlagEnabled('argentic-workflow'))

  useEffect(() => {
    if (!isAgenticWorkflowEnabled) {
      navigate({
        to: '/organization/$organizationId/settings/general',
        params: { organizationId },
        replace: true,
      })
    }
  }, [isAgenticWorkflowEnabled, navigate, organizationId])

  if (!isAgenticWorkflowEnabled) return null

  return <Outlet />
}
