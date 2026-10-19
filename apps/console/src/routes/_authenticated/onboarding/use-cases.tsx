import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/onboarding/use-cases')({
  component: () => <Navigate to="/onboarding/profile" replace />,
})
