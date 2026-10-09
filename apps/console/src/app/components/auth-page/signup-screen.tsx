import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { AuthEnum, getSsoConnectionName } from '@qovery/shared/auth'
import { IconEnum } from '@qovery/shared/enums'
import { Button, Icon, Link } from '@qovery/shared/ui'
import { useLocalStorage } from '@qovery/shared/util-hooks'
import {
  AUTH_CARD_BODY_CLASSNAME,
  AUTH_CARD_CLASSNAME,
  Auth0ErrorMessage,
  AuthLegalNotice,
  ComplianceLogos,
} from './auth-page-layout'
import { type AuthPageTrackingContext, trackAuthSecondaryCtaClicked } from './auth-page-tracking'
import { LAST_USED_SSO_DOMAIN_STORAGE_KEY, SAML_SSO_LOGIN } from './auth-page-utils'
import { AUTH_PAGE_COPY } from './auth-page.copy'
import { SECONDARY_PROVIDER_ICONS } from './login-screen'
import { SsoLoginForm } from './sso-login-form'
import { TestimonialCarousel } from './testimonial-carousel'
import { useAuth0Error, useAuthProviderLogin } from './use-auth-provider-login'

const SECONDARY_PROVIDERS = [
  { provider: AuthEnum.BITBUCKET, label: AUTH_PAGE_COPY.signUp.signUpWithBitbucket },
  { provider: AuthEnum.GITLAB, label: AUTH_PAGE_COPY.signUp.signUpWithGitlab },
  { provider: AuthEnum.MICROSOFT, label: AUTH_PAGE_COPY.signUp.signUpWithMicrosoft },
]

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

export interface SignUpScreenProps {
  redirect?: string
  trackingContext: AuthPageTrackingContext
  onLogInInstead: () => void
}

export function SignUpScreen({ redirect, trackingContext, onLogInInstead }: SignUpScreenProps) {
  useMobileFriendlyBody()
  const { auth0Error, setAuth0Error } = useAuth0Error()
  const { login, isLoading } = useAuthProviderLogin({ redirect, trackingContext })
  const [lastUsedSsoDomain, setLastUsedSsoDomain] = useLocalStorage<string | undefined>(
    LAST_USED_SSO_DOMAIN_STORAGE_KEY,
    undefined
  )
  const [lastUsedSsoDomainAtPageLoad] = useState(lastUsedSsoDomain)
  const [ssoFormVisible, setSsoFormVisible] = useState(false)

  const validateAndConnect = (domain: string) => {
    setLastUsedSsoDomain(domain)
    login(getSsoConnectionName(domain), SAML_SSO_LOGIN)
  }

  return (
    <div data-theme="light" className="flex min-h-screen w-full flex-col bg-background-secondary lg:h-screen">
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 px-4">
        <Link href="https://www.qovery.com" color="subtle">
          <Icon iconName="arrow-left" />
          {AUTH_PAGE_COPY.shared.backToWebsite}
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-neutral-subtle sm:inline">{AUTH_PAGE_COPY.signUp.logInPrompt}</span>
          <Button
            variant="outline"
            color="neutral"
            size="md"
            onClick={() => {
              trackAuthSecondaryCtaClicked(trackingContext, 'log_in_instead')
              onLogInInstead()
            }}
          >
            {AUTH_PAGE_COPY.signUp.logInLink}
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-2 py-8 sm:px-4 lg:overflow-y-auto">
        <div className={clsx(AUTH_CARD_CLASSNAME, 'm-auto')}>
          <div className={AUTH_CARD_BODY_CLASSNAME}>
            <img className="mx-auto mb-8 h-6" src="/assets/logos/logo-black.svg" alt={AUTH_PAGE_COPY.shared.logoAlt} />

            <h1 className="text-center font-brand text-2xl font-normal leading-8 text-neutral">
              {ssoFormVisible ? AUTH_PAGE_COPY.sso.title : AUTH_PAGE_COPY.signUp.title}
            </h1>
            <p className="mb-6 mt-2 text-center text-sm text-neutral-subtle">
              {ssoFormVisible ? AUTH_PAGE_COPY.sso.description : AUTH_PAGE_COPY.signUp.subtitle}
            </p>

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
                  {AUTH_PAGE_COPY.signUp.signUpWithGoogle}
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
                  {AUTH_PAGE_COPY.signUp.signUpWithGithub}
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
                  {AUTH_PAGE_COPY.login.continueWithSamlSso}
                </Button>

                <div className="my-2 flex items-center gap-4">
                  <div className="h-px flex-1 bg-surface-neutral-component" />
                  <span className="text-ssm text-neutral-subtle">{AUTH_PAGE_COPY.signUp.or}</span>
                  <div className="h-px flex-1 bg-surface-neutral-component" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {SECONDARY_PROVIDERS.map(({ provider, label }) => (
                    <Button
                      key={provider}
                      variant="outline"
                      color="neutral"
                      size="lg"
                      className="relative justify-center"
                      aria-label={label}
                      onClick={() => login(provider)}
                      loading={isLoading(provider)}
                    >
                      <Icon
                        width="20"
                        fill="currentColor"
                        className={clsx(isLoading(provider) && 'opacity-0')}
                        name={SECONDARY_PROVIDER_ICONS[provider]}
                      />
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {auth0Error && <Auth0ErrorMessage error={auth0Error.error} description={auth0Error.error_description} />}

            <AuthLegalNotice prefix={AUTH_PAGE_COPY.signUp.legalPrefix} />
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
