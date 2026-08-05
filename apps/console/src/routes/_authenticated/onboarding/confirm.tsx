import { useAuth0 } from '@auth0/auth0-react'
import { Navigate, createFileRoute } from '@tanstack/react-router'
import { StepConfirm } from '@qovery/domains/onboarding/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/onboarding/confirm')({
  component: Confirm,
})

function Confirm() {
  useDocumentTitle('Onboarding Confirm - Qovery')
  const { isAuthenticated } = useAuth0()

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: '/' }} />
  }

  return <StepConfirm />
}
