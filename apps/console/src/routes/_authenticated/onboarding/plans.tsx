import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/onboarding/plans')({
  component: () => <Navigate to="/onboarding/profile" replace />,
})
