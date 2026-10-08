import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { AuthEnum, getSsoConnectionName } from '@qovery/shared/auth'
import { IconEnum } from '@qovery/shared/enums'
import { Button, ExternalLink, Icon, linkVariants } from '@qovery/shared/ui'
import { useLocalStorage } from '@qovery/shared/util-hooks'
import { Auth0ErrorMessage, AuthLegalNotice, AuthPageLayout, ComplianceLogos } from './auth-page-layout'
import { type AuthPageTrackingContext, trackAuthSecondaryCtaClicked } from './auth-page-tracking'
import { BOOK_DEMO_URL, LAST_USED_SSO_DOMAIN_STORAGE_KEY, SAML_SSO_LOGIN } from './auth-page-utils'
import { AUTH_PAGE_COPY } from './auth-page.copy'
import { CustomerQuote, SIGNUP_CUSTOMER_QUOTE } from './customer-quote'
import { LOGIN_PANEL_CONTENT_TRANSITION, LOGIN_PANEL_LAYOUT_TRANSITION } from './login-screen'
import { SsoLoginForm } from './sso-login-form'
import { useAuth0Error, useAuthProviderLogin } from './use-auth-provider-login'

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

function StaticProductVisual() {
  return (
    <div
      data-testid="signup-visual"
      className="pointer-events-none relative hidden lg:block lg:h-screen lg:max-w-[1280px] lg:flex-[2_1_0%]"
    >
      <img
        src="/assets/login/onboarding-background.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-full w-auto max-w-none select-none"
      />

      <div className="absolute inset-0 z-10 [-webkit-mask-image:radial-gradient(225.19%_100%_at_50%_0%,#D9D9D9_60%,rgba(217,217,217,0)_76%)] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%] [mask-image:radial-gradient(225.19%_100%_at_50%_0%,#D9D9D9_60%,rgba(217,217,217,0)_76%)] [mask-repeat:no-repeat] [mask-size:100%_100%]">
        <img
          src="/assets/login/product-shots/deployed-and-running.jpg"
          alt={AUTH_PAGE_COPY.signUp.productShotAlt}
          className="relative top-[10%] ml-32 aspect-[2940/2080] h-[62%] max-h-[720px] select-none rounded-2xl shadow-[0_0_25px_0_rgba(0,0,0,0.04),0_2px_5px_0_rgba(0,0,0,0.02)] xl:ml-44 2xl:ml-52"
        />
      </div>

      <div className="absolute bottom-8 left-1/2 z-dropdown flex w-full max-w-2xl -translate-x-1/2 flex-col items-center gap-6 px-8">
        {SIGNUP_CUSTOMER_QUOTE && <CustomerQuote {...SIGNUP_CUSTOMER_QUOTE} />}
        <CustomerLogos />
        <div className="flex items-center gap-6">
          <ComplianceLogos />
        </div>
      </div>
    </div>
  )
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

  const inlineLinkClassName = linkVariants({ color: 'sky', size: 'sm' })

  return (
    <AuthPageLayout
      card={
        <div className="flex w-full max-w-[480px] flex-col gap-6 py-16 lg:min-w-[480px] lg:py-0">
          <motion.div
            layout
            transition={LOGIN_PANEL_LAYOUT_TRANSITION}
            className="w-full rounded-2xl border border-neutral bg-surface-neutral-subtle shadow-[0_2px_5px_0_rgba(0,0,0,0.02),0_0_24px_0_rgba(0,0,0,0.04)]"
          >
            <motion.div
              layout
              transition={LOGIN_PANEL_LAYOUT_TRANSITION}
              className="relative rounded-2xl bg-background px-4 pb-4 pt-8 outline outline-[1px] outline-neutral sm:px-8 sm:pb-6"
            >
              <img
                className="mx-auto mb-6 h-6 sm:mb-8"
                src="/assets/logos/logo-black.svg"
                alt={AUTH_PAGE_COPY.shared.logoAlt}
              />

              <h1 className="mb-2 text-center font-brand text-xl font-normal leading-7 text-neutral sm:text-2xl sm:leading-8">
                {ssoFormVisible ? AUTH_PAGE_COPY.sso.title : AUTH_PAGE_COPY.signUp.title}
              </h1>

              <AnimatePresence initial={false} mode="popLayout">
                {ssoFormVisible ? (
                  <motion.div
                    key="sso-login"
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={LOGIN_PANEL_CONTENT_TRANSITION}
                    className="overflow-hidden"
                  >
                    <p className="mb-6 text-center text-base text-neutral-subtle">{AUTH_PAGE_COPY.sso.description}</p>
                    <SsoLoginForm
                      defaultDomain={lastUsedSsoDomainAtPageLoad}
                      onConnect={validateAndConnect}
                      onBack={() => setSsoFormVisible(false)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup-providers"
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={LOGIN_PANEL_CONTENT_TRANSITION}
                  >
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
                    </div>

                    <p className="mt-4 text-center text-sm text-neutral-subtle">
                      {AUTH_PAGE_COPY.signUp.ssoPrompt}{' '}
                      <button
                        type="button"
                        className={inlineLinkClassName}
                        onClick={() => {
                          setSsoFormVisible(true)
                          setAuth0Error(null)
                        }}
                      >
                        {AUTH_PAGE_COPY.signUp.ssoLink}
                      </button>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {auth0Error && <Auth0ErrorMessage error={auth0Error.error} description={auth0Error.error_description} />}

              <AuthLegalNotice />
            </motion.div>

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
          </motion.div>

          {/* The visual panel is hidden below `lg`: keep the social proof on small screens */}
          <CustomerLogos className="lg:hidden" />
        </div>
      }
      visual={<StaticProductVisual />}
    />
  )
}
