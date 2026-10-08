import clsx from 'clsx'
import { useEffect } from 'react'
import { AuthEnum } from '@qovery/shared/auth'
import { IconEnum } from '@qovery/shared/enums'
import { Button, ExternalLink, Icon, linkVariants } from '@qovery/shared/ui'
import { Auth0ErrorMessage, AuthLegalNotice, AuthPageLayout } from './auth-page-layout'
import { type AuthPageTrackingContext, trackAuthSecondaryCtaClicked } from './auth-page-tracking'
import { BOOK_DEMO_URL } from './auth-page-utils'
import { AUTH_PAGE_COPY } from './auth-page.copy'
import { AnimatedProductShots, SECONDARY_PROVIDER_ICONS } from './login-screen'
import { useAuth0Error, useAuthProviderLogin } from './use-auth-provider-login'

const SECONDARY_PROVIDERS = [
  { provider: AuthEnum.BITBUCKET, label: AUTH_PAGE_COPY.signUp.signUpWithBitbucket },
  { provider: AuthEnum.GITLAB, label: AUTH_PAGE_COPY.signUp.signUpWithGitlab },
  { provider: AuthEnum.MICROSOFT, label: AUTH_PAGE_COPY.signUp.signUpWithMicrosoft },
]

const CUSTOMER_LOGOS = [
  { name: 'Alan', src: '/assets/login/testimonials-logo/alan.svg' },
  { name: 'Spiko', src: '/assets/login/testimonials-logo/spiko.svg' },
  { name: 'Talkspace', src: '/assets/login/testimonials-logo/talkspace.svg' },
  { name: 'Charles.co', src: '/assets/login/testimonials-logo/charles_co.png' },
  { name: 'kelvin', src: '/assets/login/testimonials-logo/kelvin.png' },
  { name: 'Tint', src: '/assets/login/testimonials-logo/tint.png' },
]

function CustomerLogos({ className }: { className?: string }) {
  return (
    <div className={clsx('flex flex-col items-center gap-3', className)}>
      <p className="text-sm text-neutral-subtle">{AUTH_PAGE_COPY.signUp.trustedBy}</p>
      <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {CUSTOMER_LOGOS.map(({ name, src }) => (
          <li key={name} className="flex items-center gap-1.5 text-sm font-medium text-neutral">
            <img src={src} alt="" aria-hidden className="h-4 w-4 rounded-sm object-contain" />
            {name}
          </li>
        ))}
      </ul>
    </div>
  )
}

// The console sets a desktop `min-width` and `overflow: hidden` on <body>: lift them while the sign-up screen
// is displayed so prospects on a phone get a real mobile layout that scrolls
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
  const { auth0Error } = useAuth0Error()
  const { login, isLoading } = useAuthProviderLogin({ redirect, trackingContext })

  const inlineLinkClassName = linkVariants({ color: 'sky', size: 'sm' })

  return (
    <AuthPageLayout
      card={
        <div className="flex w-full max-w-[480px] flex-col gap-6 py-16 lg:min-w-[480px] lg:py-0">
          <div className="w-full rounded-2xl border border-neutral bg-surface-neutral-subtle shadow-[0_2px_5px_0_rgba(0,0,0,0.02),0_0_24px_0_rgba(0,0,0,0.04)]">
            <div className="relative rounded-2xl bg-background px-4 pb-4 pt-8 outline outline-[1px] outline-neutral sm:px-8 sm:pb-6">
              <img
                className="mx-auto mb-6 h-6 sm:mb-8"
                src="/assets/logos/logo-black.svg"
                alt={AUTH_PAGE_COPY.shared.logoAlt}
              />

              <h1 className="mb-2 text-center font-brand text-xl font-normal leading-7 text-neutral sm:text-2xl sm:leading-8">
                {AUTH_PAGE_COPY.signUp.title}
              </h1>

              <ul className="mx-auto mb-6 mt-4 flex w-fit flex-col gap-2">
                {AUTH_PAGE_COPY.signUp.reassurances.map((reassurance) => (
                  <li key={reassurance} className="flex items-start gap-2 text-sm text-neutral">
                    <Icon iconName="circle-check" iconStyle="solid" className="mt-0.5 text-positive" />
                    {reassurance}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2.5">
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

                <div className="my-2 flex items-center gap-4">
                  <div className="h-px flex-1 bg-surface-neutral-component" />
                  <span className="font-code text-xs uppercase tracking-wide text-neutral-subtle">
                    {AUTH_PAGE_COPY.login.or}
                  </span>
                  <div className="h-px flex-1 bg-surface-neutral-component" />
                </div>

                <div className="grid grid-cols-3 gap-2.5">
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

              {auth0Error && <Auth0ErrorMessage error={auth0Error.error} description={auth0Error.error_description} />}

              <AuthLegalNotice />
            </div>

            <div className="flex flex-col items-center gap-1 px-4 py-4 text-center text-sm text-neutral-subtle">
              <p>
                {AUTH_PAGE_COPY.signUp.logInPrompt}{' '}
                <button
                  type="button"
                  className={inlineLinkClassName}
                  onClick={() => {
                    trackAuthSecondaryCtaClicked(trackingContext, 'log_in_instead')
                    onLogInInstead()
                  }}
                >
                  {AUTH_PAGE_COPY.signUp.logInLink}
                </button>
              </p>
              <p>
                {AUTH_PAGE_COPY.signUp.demoPrompt}{' '}
                <ExternalLink
                  href={BOOK_DEMO_URL}
                  color="sky"
                  size="sm"
                  withIcon={false}
                  onClick={() => trackAuthSecondaryCtaClicked(trackingContext, 'book_demo')}
                >
                  {AUTH_PAGE_COPY.signUp.demoLink}
                </ExternalLink>
              </p>
            </div>
          </div>

          {/* The product shots panel is hidden below `lg`: keep some social proof on small screens */}
          <CustomerLogos className="lg:hidden" />
        </div>
      }
      visual={<AnimatedProductShots />}
    />
  )
}
