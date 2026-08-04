import { useAuth0 } from '@auth0/auth0-react'
import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router'
import { StepConfirm, getProviderDisplay, getProviderKeyFromSub } from '@qovery/domains/onboarding/feature'
import { useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { LAST_USED_LOGIN_STORAGE_KEY, useAuth } from '@qovery/shared/auth'
import { getOnboardingEntryUrl } from '@qovery/shared/routes'
import { useDocumentTitle, useLocalStorage } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/onboarding/confirm')({
  component: Confirm,
})

function Confirm() {
  useDocumentTitle('Onboarding Confirm - Qovery')
  const { isAuthenticated } = useAuth0()
  const navigate = useNavigate()
  const { user, authLogout } = useAuth()
  const { data: userSignUp } = useUserSignUp()
  const [lastUsedLogin] = useLocalStorage<string | undefined>(LAST_USED_LOGIN_STORAGE_KEY, undefined)

  const provider = getProviderDisplay(getProviderKeyFromSub(user?.sub))
  const previousProvider = getProviderDisplay(lastUsedLogin)

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: '/' }} />
  }

  return (
    <StepConfirm
      provider={provider}
      email={user?.email}
      previousProvider={previousProvider}
      onContinue={() => navigate({ href: getOnboardingEntryUrl(userSignUp) })}
      onWrongAccount={() => authLogout()}
    />
  )
}
