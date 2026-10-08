import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { AuthEnum, getSsoConnectionName } from '@qovery/shared/auth'
import { IconEnum } from '@qovery/shared/enums'
import { Badge, Button, Icon } from '@qovery/shared/ui'
import { useLocalStorage } from '@qovery/shared/util-hooks'
import { Auth0ErrorMessage, AuthLegalNotice, AuthPageLayout, ComplianceLogos } from './auth-page-layout'
import { type AuthPageTrackingContext } from './auth-page-tracking'
import { LAST_USED_LOGIN_STORAGE_KEY, LAST_USED_SSO_DOMAIN_STORAGE_KEY, SAML_SSO_LOGIN } from './auth-page-utils'
import { AUTH_PAGE_COPY } from './auth-page.copy'
import { SsoLoginForm } from './sso-login-form'
import { useAuth0Error, useAuthProviderLogin } from './use-auth-provider-login'

const CUBIC_BEZIER_EASE = [0.65, 0.05, 0.36, 1] as const
const SCREEN_STACK_MOVE_DURATION_S = 0.6
const SCREEN_STACK_HOLD_DURATION_S = 8
const SCREEN_STACK_OFFSET_PX = 16
const SCREEN_STACK_MIDDLE_OPACITY = 0.9
const SCREEN_STACK_BACK_OPACITY = 0.45
const LOGIN_PANEL_LAYOUT_TRANSITION = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
} as const
const LOGIN_PANEL_CONTENT_TRANSITION = {
  duration: 0.18,
  ease: 'easeOut',
} as const
const PRODUCT_SHOTS = [
  '/assets/login/product-shots/deployed-and-running.jpg',
  '/assets/login/product-shots/project-overview.jpg',
  '/assets/login/product-shots/monitoring.jpg',
  '/assets/login/product-shots/service-logs.jpg',
]

const TESTIMONIALS = [
  <>
    <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      <img
        src="/assets/login/testimonials-logo/alan.svg"
        alt="Alan logo"
        aria-hidden
        className="h-full w-full object-contain"
      />
    </span>
    <span className="text-center">
      <span className="text-neutral">Alan</span> has reduced their deployment time by{' '}
      <span className="text-neutral">85%</span>
    </span>
  </>,
  <>
    <span className="flex h-3 w-3 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      <img
        src="/assets/login/testimonials-logo/kelvin.png"
        alt="Kelvin logo"
        aria-hidden
        className="h-full w-full object-contain"
      />
    </span>
    <span className="text-center">
      <span className="text-neutral">kelvin</span> slashed their deployment times by{' '}
      <span className="text-neutral">80%</span>
    </span>
  </>,
  <>
    <span className="flex h-3 w-3 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      <img
        src="/assets/login/testimonials-logo/charles_co.png"
        alt="Charles Co logo"
        aria-hidden
        className="h-full w-full object-contain"
      />
    </span>
    <span className="text-center">
      <span className="text-neutral">Charles.co</span> tripled their deployment speed with{' '}
      <span className="text-neutral">zero</span> downtime
    </span>
  </>,
  <>
    <span className="flex h-3 w-3 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      <img
        src="/assets/login/testimonials-logo/talkspace.svg"
        alt="Talskpace logo"
        aria-hidden
        className="h-full w-full object-contain"
      />
    </span>
    <span className="text-center">
      <span className="text-neutral">Talskpace</span> has reduced infrastructure time by{' '}
      <span className="text-neutral">50%</span>
    </span>
  </>,
  <>
    <span className="flex h-3 w-3 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      <img
        src="/assets/login/testimonials-logo/tint.png"
        alt="Tint logo"
        aria-hidden
        className="h-full w-full object-contain"
      />
    </span>
    <span className="text-center">
      <span className="text-neutral">Tint</span> has accelerated compliance by "weeks, if not months"
    </span>
  </>,
  <>
    <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      <img
        src="/assets/login/testimonials-logo/spiko.svg"
        alt="Spiko logo"
        aria-hidden
        className="h-full w-full object-contain"
      />
    </span>
    <span className="text-center">
      <span className="text-neutral">Spiko</span> has reduced their infrastructure setup time by{' '}
      <span className="text-neutral">70%</span>
    </span>
  </>,
]

export const SECONDARY_PROVIDER_ICONS: Record<string, IconEnum> = {
  [AuthEnum.BITBUCKET]: IconEnum.BITBUCKET,
  [AuthEnum.GITLAB]: IconEnum.GITLAB,
  [AuthEnum.MICROSOFT]: IconEnum.MICROSOFT,
}

function shuffleArray<T>(values: T[]) {
  const shuffled = [...values]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function LastUsedBadge({ visible }: { visible: boolean }) {
  if (!visible) {
    return null
  }

  return (
    <Badge size="sm" variant="surface" color="green" className="absolute -right-1.5 -top-1.5 px-1">
      {AUTH_PAGE_COPY.login.lastUsed}
    </Badge>
  )
}

export function AnimatedProductShots() {
  const [frontShotIndex, setFrontShotIndex] = useState(() =>
    PRODUCT_SHOTS.length > 0 ? Math.floor(Math.random() * PRODUCT_SHOTS.length) : 0
  )
  const [screenStackCycleKey, setScreenStackCycleKey] = useState(0)

  const handleScreenStackFrontAnimationComplete = () => {
    setFrontShotIndex((previous) => (PRODUCT_SHOTS.length > 0 ? (previous + 1) % PRODUCT_SHOTS.length : 0))
    setScreenStackCycleKey((previous) => previous + 1)
  }

  return (
    <div className="pointer-events-none relative hidden lg:block lg:h-screen lg:max-w-[1280px] lg:flex-[2_1_0%]">
      <img
        src="/assets/login/onboarding-background.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-full w-auto max-w-none select-none"
      />

      <div className="absolute inset-0 z-10 [-webkit-mask-image:radial-gradient(225.19%_100%_at_50%_0%,#D9D9D9_72%,rgba(217,217,217,0)_88%)] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%] [mask-image:radial-gradient(225.19%_100%_at_50%_0%,#D9D9D9_72%,rgba(217,217,217,0)_88%)] [mask-repeat:no-repeat] [mask-size:100%_100%]">
        <div
          key={screenStackCycleKey}
          className="relative top-1/2 -mt-10 ml-32 aspect-[2940/2080] h-[80%] max-h-[800px] -translate-y-1/2 skew-x-[15deg] select-none xl:ml-44 xl:max-h-[1200px] 2xl:ml-52"
        >
          <motion.img
            src={PRODUCT_SHOTS[frontShotIndex]}
            aria-hidden
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: SCREEN_STACK_OFFSET_PX,
              y: -SCREEN_STACK_OFFSET_PX,
              opacity: 0,
              transition: {
                delay: SCREEN_STACK_HOLD_DURATION_S,
                duration: SCREEN_STACK_MOVE_DURATION_S,
                ease: CUBIC_BEZIER_EASE,
              },
            }}
            onAnimationComplete={handleScreenStackFrontAnimationComplete}
            className="absolute left-0 top-0 z-40 h-full rounded-2xl shadow-[0_0_25px_0_rgba(0,0,0,0.04),0_2px_5px_0_rgba(0,0,0,0.02)]"
          />
          <motion.img
            key={`incoming-front-${frontShotIndex}`}
            src={PRODUCT_SHOTS[(frontShotIndex + 1) % PRODUCT_SHOTS.length]}
            aria-hidden
            initial={{ x: -SCREEN_STACK_OFFSET_PX, y: SCREEN_STACK_OFFSET_PX, opacity: 0 }}
            animate={{
              x: 0,
              y: 0,
              opacity: 1,
              transition: {
                delay: SCREEN_STACK_HOLD_DURATION_S,
                duration: SCREEN_STACK_MOVE_DURATION_S,
                ease: CUBIC_BEZIER_EASE,
              },
            }}
            className="absolute left-0 top-0 z-[35] h-full rounded-2xl"
          />
          <motion.div
            initial={{
              x: -SCREEN_STACK_OFFSET_PX,
              y: SCREEN_STACK_OFFSET_PX,
              opacity: SCREEN_STACK_MIDDLE_OPACITY,
            }}
            animate={{
              x: 0,
              y: 0,
              opacity: 1,
              transition: {
                delay: SCREEN_STACK_HOLD_DURATION_S,
                duration: SCREEN_STACK_MOVE_DURATION_S,
                ease: CUBIC_BEZIER_EASE,
              },
            }}
            className="absolute left-0 top-0 z-30 h-full w-full rounded-2xl bg-surface-neutral shadow-[0_0_25px_0_rgba(0,0,0,0.04),0_2px_5px_0_rgba(0,0,0,0.02)]"
          />
          <motion.div
            initial={{
              x: -2 * SCREEN_STACK_OFFSET_PX,
              y: 2 * SCREEN_STACK_OFFSET_PX,
              opacity: SCREEN_STACK_BACK_OPACITY,
            }}
            animate={{
              x: -SCREEN_STACK_OFFSET_PX,
              y: SCREEN_STACK_OFFSET_PX,
              opacity: SCREEN_STACK_MIDDLE_OPACITY,
              transition: {
                delay: SCREEN_STACK_HOLD_DURATION_S,
                duration: SCREEN_STACK_MOVE_DURATION_S,
                ease: CUBIC_BEZIER_EASE,
              },
            }}
            className="absolute left-0 top-0 z-20 h-full w-full rounded-2xl bg-surface-neutral shadow-[0_0_25px_0_rgba(0,0,0,0.04),0_2px_5px_0_rgba(0,0,0,0.02)]"
          />
          <motion.div
            initial={{ x: -3 * SCREEN_STACK_OFFSET_PX, y: 3 * SCREEN_STACK_OFFSET_PX, opacity: 0 }}
            animate={{
              x: -2 * SCREEN_STACK_OFFSET_PX,
              y: 2 * SCREEN_STACK_OFFSET_PX,
              opacity: SCREEN_STACK_BACK_OPACITY,
              transition: {
                delay: SCREEN_STACK_HOLD_DURATION_S,
                duration: SCREEN_STACK_MOVE_DURATION_S,
                ease: CUBIC_BEZIER_EASE,
              },
            }}
            className="absolute left-0 top-0 z-10 h-full w-full rounded-2xl bg-surface-neutral shadow-[0_0_25px_0_rgba(0,0,0,0.04),0_2px_5px_0_rgba(0,0,0,0.02)]"
          />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 z-dropdown flex -translate-x-1/2 items-center gap-6">
        <ComplianceLogos />
      </div>
    </div>
  )
}

export interface LoginScreenProps {
  redirect?: string
  trackingContext: AuthPageTrackingContext
}

export function LoginScreen({ redirect, trackingContext }: LoginScreenProps) {
  const { auth0Error, setAuth0Error } = useAuth0Error()
  const { login, isLoading } = useAuthProviderLogin({ redirect, trackingContext })
  const [lastUsedLogin] = useLocalStorage<string | undefined>(LAST_USED_LOGIN_STORAGE_KEY, undefined)
  const [lastUsedLoginAtPageLoad] = useState(lastUsedLogin)
  const [lastUsedSsoDomain, setLastUsedSsoDomain] = useLocalStorage<string | undefined>(
    LAST_USED_SSO_DOMAIN_STORAGE_KEY,
    undefined
  )
  const [lastUsedSsoDomainAtPageLoad] = useState(lastUsedSsoDomain)
  // Bring back users who last connected with SAML SSO straight to the pre-filled SSO form
  const [ssoFormVisible, setSsoFormVisible] = useState(
    lastUsedLoginAtPageLoad === SAML_SSO_LOGIN && Boolean(lastUsedSsoDomainAtPageLoad)
  )

  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [isTestimonialExiting, setIsTestimonialExiting] = useState(true)
  const [shuffledTestimonials] = useState(() => shuffleArray(TESTIMONIALS))

  const handleTestimonialAnimationComplete = () => {
    if (isTestimonialExiting) {
      setTestimonialIndex((previous) =>
        shuffledTestimonials.length > 0 ? (previous + 1) % shuffledTestimonials.length : 0
      )
      setIsTestimonialExiting(false)
      return
    }

    setIsTestimonialExiting(true)
  }

  const validateAndConnect = (domain: string) => {
    setLastUsedSsoDomain(domain)
    login(getSsoConnectionName(domain), SAML_SSO_LOGIN)
  }

  return (
    <AuthPageLayout
      card={
        <motion.div
          layout
          transition={LOGIN_PANEL_LAYOUT_TRANSITION}
          className="w-full max-w-[480px] rounded-2xl border border-neutral bg-surface-neutral-subtle shadow-[0_2px_5px_0_rgba(0,0,0,0.02),0_0_24px_0_rgba(0,0,0,0.04)] lg:min-w-[480px]"
        >
          <motion.div
            layout
            transition={LOGIN_PANEL_LAYOUT_TRANSITION}
            className="relative rounded-2xl bg-background px-4 pb-4 pt-8 outline outline-[1px] outline-neutral sm:px-8 sm:pb-6"
          >
            <img className="mx-auto mb-8 h-6" src="/assets/logos/logo-black.svg" alt={AUTH_PAGE_COPY.shared.logoAlt} />

            <h1
              className={clsx(
                'text-center font-brand text-2xl font-normal leading-8 text-neutral',
                ssoFormVisible ? 'mb-2' : 'mb-6'
              )}
            >
              {ssoFormVisible ? AUTH_PAGE_COPY.sso.title : AUTH_PAGE_COPY.login.title}
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
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.14, ease: 'easeOut' } }}
                    exit={{ opacity: 0, y: -4, transition: { duration: 0.08, ease: 'easeIn' } }}
                    className="mb-6 text-center text-base text-neutral-subtle"
                  >
                    {AUTH_PAGE_COPY.sso.description}
                  </motion.p>

                  <SsoLoginForm
                    defaultDomain={lastUsedSsoDomainAtPageLoad}
                    onConnect={validateAndConnect}
                    onBack={() => setSsoFormVisible(false)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="login-providers"
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={LOGIN_PANEL_CONTENT_TRANSITION}
                  className="overflow-visible"
                >
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
                      {AUTH_PAGE_COPY.login.continueWithGoogle}
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
                      {AUTH_PAGE_COPY.login.continueWithGithub}
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
                      {AUTH_PAGE_COPY.login.continueWithSamlSso}
                      <LastUsedBadge visible={lastUsedLoginAtPageLoad === SAML_SSO_LOGIN} />
                    </Button>

                    <div className="my-2 flex items-center gap-4">
                      <div className="h-px flex-1 bg-surface-neutral-component" />
                      <span className="font-code text-xs uppercase tracking-wide text-neutral-subtle">
                        {AUTH_PAGE_COPY.login.or}
                      </span>
                      <div className="h-px flex-1 bg-surface-neutral-component" />
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {[AuthEnum.BITBUCKET, AuthEnum.GITLAB, AuthEnum.MICROSOFT].map((provider) => (
                        <Button
                          key={provider}
                          variant="outline"
                          color="neutral"
                          size="lg"
                          className="relative justify-center"
                          onClick={() => login(provider)}
                          loading={isLoading(provider)}
                        >
                          <Icon
                            width="20"
                            fill="currentColor"
                            className={clsx(isLoading(provider) ? 'opacity-0' : '')}
                            name={SECONDARY_PROVIDER_ICONS[provider]}
                          />
                          <LastUsedBadge visible={lastUsedLoginAtPageLoad === provider} />
                        </Button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {auth0Error && <Auth0ErrorMessage error={auth0Error.error} description={auth0Error.error_description} />}

            <AuthLegalNotice />
          </motion.div>

          <motion.div
            key={testimonialIndex}
            initial={isTestimonialExiting ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            animate={
              isTestimonialExiting
                ? {
                    opacity: 0,
                    y: -8,
                    transition: { delay: 5.2, duration: 0.4, ease: [0.55, 0.085, 0.68, 0.53] },
                  }
                : {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: 'easeOut' },
                  }
            }
            onAnimationComplete={handleTestimonialAnimationComplete}
            className="flex items-center justify-center gap-2 px-4 py-4 text-sm text-neutral-subtle"
          >
            {shuffledTestimonials[testimonialIndex]}
          </motion.div>
        </motion.div>
      }
      visual={<AnimatedProductShots />}
    />
  )
}
