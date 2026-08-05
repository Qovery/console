import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from '@tanstack/react-router'
import { useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { PREVIOUS_USED_LOGIN_STORAGE_KEY, useAuth } from '@qovery/shared/auth'
import { IconEnum } from '@qovery/shared/enums'
import { getOnboardingEntryUrl } from '@qovery/shared/routes'
import { Button, Heading, Icon, Section } from '@qovery/shared/ui'
import { useLocalStorage } from '@qovery/shared/util-hooks'

export interface ProviderDisplay {
  label: string
  icon: IconEnum
}

const PROVIDER_DISPLAY_BY_KEY: Record<string, ProviderDisplay> = {
  github: { label: 'GitHub', icon: IconEnum.GITHUB },
  Gitlab: { label: 'GitLab', icon: IconEnum.GITLAB },
  'google-oauth2': { label: 'Google', icon: IconEnum.GOOGLE },
  windowslive: { label: 'Microsoft', icon: IconEnum.MICROSOFT },
  bitbucket: { label: 'Bitbucket', icon: IconEnum.BITBUCKET },
}

export function getProviderKeyFromSub(sub?: string | null): string | undefined {
  return sub?.split('|')[0]
}

export function getProviderDisplay(providerKey?: string | null): ProviderDisplay | undefined {
  if (!providerKey) return undefined
  return PROVIDER_DISPLAY_BY_KEY[providerKey]
}

export function StepConfirm() {
  const navigate = useNavigate()
  const { user } = useAuth0()
  const { authLogout } = useAuth()
  const { data: userSignUp } = useUserSignUp()
  const [previousUsedLogin] = useLocalStorage<string | undefined>(PREVIOUS_USED_LOGIN_STORAGE_KEY, undefined)

  const provider = getProviderDisplay(getProviderKeyFromSub(user?.sub))
  const previousProvider = getProviderDisplay(previousUsedLogin)
  const showPreviousProviderHint = previousProvider && previousProvider.label !== provider?.label

  return (
    <Section className="flex min-h-screen items-center justify-center bg-background-secondary px-4">
      <div className="w-full max-w-[480px] rounded-2xl border border-neutral bg-surface-neutral-subtle shadow-[0_2px_5px_0_rgba(0,0,0,0.02),0_0_24px_0_rgba(0,0,0,0.04)]">
        <div className="rounded-2xl bg-background px-4 pb-6 pt-8 outline outline-[1px] outline-neutral sm:px-8">
          <img className="mx-auto mb-8 h-6" src="/assets/logos/logo-black.svg" alt="Qovery logo" />

          <Heading level={1} className="mb-2 text-center">
            Already have a Qovery account?
          </Heading>
          <p className="mb-6 text-center text-sm text-neutral-subtle">
            You're about to create a brand new organization. If you already have a Qovery account, sign in with the
            right provider instead.
          </p>

          {provider && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-neutral p-4">
              <Icon name={provider.icon} width="20" className="shrink-0" />
              <div className="flex flex-col gap-1 leading-tight">
                <span className="text-sm font-medium text-neutral">Signed in with {provider.label}</span>
                {user?.email && <span className="text-ssm text-neutral-subtle">{user.email}</span>}
              </div>
            </div>
          )}

          {showPreviousProviderHint && (
            <p className="mb-6 text-center text-ssm text-neutral-subtle">
              Last time on this browser, you signed in with {previousProvider?.label}.
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Button
              size="lg"
              className="w-full justify-center"
              onClick={() => navigate({ href: getOnboardingEntryUrl(userSignUp) })}
            >
              Create my organization
            </Button>
            <Button
              variant="plain"
              color="brand"
              size="lg"
              className="w-full justify-center"
              onClick={() => authLogout()}
            >
              Switch account
            </Button>
          </div>

          <p className="mt-6 text-center text-ssm text-neutral-subtle">You can invite your team later.</p>
        </div>
      </div>
    </Section>
  )
}

export default StepConfirm
