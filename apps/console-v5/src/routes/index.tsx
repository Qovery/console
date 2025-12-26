import { useAuth0 } from '@auth0/auth0-react'
import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const { isAuthenticated } = useAuth0()

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: '/' }} />
  }

  return (
    <div className="p-2">
      <h3 className="text-neutral">Welcome Home!</h3>
    </div>
  )
}
