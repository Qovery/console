import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { AuthEnum, getSsoConnectionName } from '@qovery/shared/auth'
import { IconEnum } from '@qovery/shared/enums'
import { Badge, Button, Icon, Link } from '@qovery/shared/ui'
import { useLocalStorage } from '@qovery/shared/util-hooks'
import { Auth0ErrorMessage, AuthLegalNotice, BackToWebsiteLink, ComplianceLogos } from './auth-page-layout'
import { type AuthPage as AuthPageName, trackAuthPageViewed, trackAuthSecondaryCtaClicked } from './auth-page-tracking'
import {
  LAST_USED_LOGIN_STORAGE_KEY,
  LAST_USED_SSO_DOMAIN_STORAGE_KEY,
  SAML_SSO_LOGIN,
  getStoredLastUsedLogin,
} from './auth-page-utils'
import { SsoLoginForm } from './sso-login-form'
import { TestimonialCarousel } from './testimonial-carousel'
import { useAuth0Error, useAuthProviderLogin } from './use-auth-provider-login'

const PAGE_COPY = {
  login: {
    title: 'Connect to your workspace',
    subtitle: undefined,
    google: 'Continue with Google',
    github: 'Continue with GitHub',
    bitbucket: 'Continue with Bitbucket',
    gitlab: 'Continue with GitLab',
    microsoft: 'Continue with Microsoft',
    switchPrompt: 'Don’t have an account?',
    switchLink: 'Sign up',
  },
  signup: {
    title: 'Create your account',
    subtitle: 'Try Qovery free for 14 days, no credit card required.',
    google: 'Sign up with Google',
    github: 'Sign up with GitHub',
    bitbucket: 'Sign up with Bitbucket',
    gitlab: 'Sign up with GitLab',
    microsoft: 'Sign up with Microsoft',
    switchPrompt: 'Already have an account?',
    switchLink: 'Log in',
  },
} as const

const SECONDARY_PROVIDERS = [
  { provider: AuthEnum.BITBUCKET, icon: IconEnum.BITBUCKET, labelKey: 'bitbucket' },
  { provider: AuthEnum.GITLAB, icon: IconEnum.GITLAB, labelKey: 'gitlab' },
  { provider: AuthEnum.MICROSOFT, icon: IconEnum.MICROSOFT, labelKey: 'microsoft' },
] as const

function useMobileFriendlyBody() {
  useEffect(() => {
    const { minWidth, overflowY } = document.body.style
    document.body.style.minWidth = '0'
    document.body.style.overflowY = 'auto'

    return () => {
      document.body.style.minWidth = minWidth
      document.body.style.overflowY = overflowY
    }
  }, [])
}

function LastUsedBadge({ visible }: { visible: boolean }) {
  if (!visible) {
    return null
  }

  return (
    <Badge size="sm" variant="surface" color="green" className="absolute -right-1.5 -top-1.5 px-1">
      Last used
    </Badge>
  )
}

export interface AuthPageProps {
  page: AuthPageName
  redirect?: string
}

export function AuthPage({ page, redirect }: AuthPageProps) {
  useMobileFriendlyBody()
  const copy = PAGE_COPY[page]
  const isLogin = page === 'login'
  const trackingContext = { page }
  const { auth0Error, setAuth0Error } = useAuth0Error()
  const { login, isLoading } = useAuthProviderLogin({ screen: page, redirect, trackingContext })
  const [lastUsedLogin] = useLocalStorage<string | undefined>(LAST_USED_LOGIN_STORAGE_KEY, undefined)
  const [lastUsedLoginAtPageLoad] = useState(isLogin ? lastUsedLogin : undefined)
  const [lastUsedSsoDomain, setLastUsedSsoDomain] = useLocalStorage<string | undefined>(
    LAST_USED_SSO_DOMAIN_STORAGE_KEY,
    undefined
  )
  const [lastUsedSsoDomainAtPageLoad] = useState(lastUsedSsoDomain)
  // Bring back users who last connected with SAML SSO straight to the pre-filled SSO form
  const [ssoFormVisible, setSsoFormVisible] = useState(
    lastUsedLoginAtPageLoad === SAML_SSO_LOGIN && Boolean(lastUsedSsoDomainAtPageLoad)
  )

  useEffect(() => {
    trackAuthPageViewed({ page }, Boolean(getStoredLastUsedLogin()))
  }, [page])

  const validateAndConnect = (domain: string) => {
    setLastUsedSsoDomain(domain)
    login(getSsoConnectionName(domain), SAML_SSO_LOGIN)
  }

  return (
    <div data-theme="light" className="flex min-h-screen w-full flex-col bg-background-secondary lg:h-screen">
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 px-4">
        <BackToWebsiteLink />
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-neutral-subtle sm:inline">{copy.switchPrompt}</span>
          <Link
            as="button"
            to={isLogin ? '/signup' : '/login'}
            search={redirect ? { redirect } : {}}
            variant="outline"
            color="neutral"
            size="md"
            onClick={() =>
              trackAuthSecondaryCtaClicked(trackingContext, isLogin ? 'sign_up_instead' : 'log_in_instead')
            }
          >
            {copy.switchLink}
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-2 py-8 sm:px-4 lg:overflow-y-auto">
        <div className="m-auto w-full max-w-[480px] rounded-2xl border border-neutral bg-surface-neutral-subtle shadow-[0_2px_5px_0_rgba(0,0,0,0.02),0_0_24px_0_rgba(0,0,0,0.04)] lg:min-w-[480px]">
          <div className="relative rounded-2xl bg-background px-4 pb-4 pt-8 outline outline-[1px] outline-neutral sm:px-8 sm:pb-6">
            <img className="mx-auto mb-8 h-6" src="/assets/logos/logo-black.svg" alt="Qovery logo black" />

            <h1
              className={clsx(
                'text-center font-brand text-2xl font-normal leading-8 text-neutral',
                ssoFormVisible || copy.subtitle ? 'mb-2' : 'mb-6'
              )}
            >
              {ssoFormVisible ? 'Enterprise single sign-on' : copy.title}
            </h1>
            {(ssoFormVisible || copy.subtitle) && (
              <p className="mb-6 text-center text-sm text-neutral-subtle">
                {ssoFormVisible ? 'Enter your company domain to connect with SSO' : copy.subtitle}
              </p>
            )}

            {ssoFormVisible ? (
              <SsoLoginForm
                defaultDomain={lastUsedSsoDomainAtPageLoad}
                onConnect={validateAndConnect}
                onBack={() => setSsoFormVisible(false)}
              />
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  color="neutral"
                  size="lg"
                  className="relative w-full justify-center gap-x-2"
                  onClick={() => login(AuthEnum.GOOGLE_SSO)}
                  loading={isLoading(AuthEnum.GOOGLE_SSO)}
                >
                  <Icon
                    width="16"
                    className={clsx('text-neutral-subtle', isLoading(AuthEnum.GOOGLE_SSO) && 'opacity-0')}
                    name={IconEnum.GOOGLE}
                  />
                  {copy.google}
                  <LastUsedBadge visible={lastUsedLoginAtPageLoad === AuthEnum.GOOGLE_SSO} />
                </Button>

                <Button
                  variant="solid"
                  color="neutral"
                  size="lg"
                  className="relative w-full justify-center gap-x-2"
                  onClick={() => login(AuthEnum.GITHUB)}
                  loading={isLoading(AuthEnum.GITHUB)}
                >
                  <Icon
                    width="16"
                    className={clsx('text-neutralInvert', isLoading(AuthEnum.GITHUB) && 'opacity-0')}
                    fill="currentColor"
                    name={IconEnum.GITHUB_WHITE}
                  />
                  {copy.github}
                  <LastUsedBadge visible={lastUsedLoginAtPageLoad === AuthEnum.GITHUB} />
                </Button>

                <Button
                  variant="outline"
                  color="neutral"
                  size="lg"
                  className="relative w-full justify-center"
                  onClick={() => {
                    setSsoFormVisible(true)
                    setAuth0Error(null)
                  }}
                >
                  <Icon iconName="lock" className="text-sm text-neutral-subtle" />
                  Continue with SAML SSO
                  <LastUsedBadge visible={lastUsedLoginAtPageLoad === SAML_SSO_LOGIN} />
                </Button>

                <div className="my-2 flex items-center gap-4">
                  <div className="h-px flex-1 bg-surface-neutral-component" />
                  <span className="text-ssm text-neutral-subtle">or</span>
                  <div className="h-px flex-1 bg-surface-neutral-component" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {SECONDARY_PROVIDERS.map(({ provider, icon, labelKey }) => (
                    <Button
                      key={provider}
                      variant="outline"
                      color="neutral"
                      size="lg"
                      className="relative justify-center"
                      aria-label={copy[labelKey]}
                      onClick={() => login(provider)}
                      loading={isLoading(provider)}
                    >
                      <Icon
                        width="20"
                        fill="currentColor"
                        className={clsx(isLoading(provider) && 'opacity-0')}
                        name={icon}
                      />
                      <LastUsedBadge visible={lastUsedLoginAtPageLoad === provider} />
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {auth0Error && <Auth0ErrorMessage error={auth0Error.error} description={auth0Error.error_description} />}

            <AuthLegalNotice />
          </div>

          <TestimonialCarousel />
        </div>
      </main>

      <footer className="flex shrink-0 flex-wrap items-center justify-center gap-6 px-4 pb-6 pt-2">
        <ComplianceLogos />
      </footer>
    </div>
  )
}
