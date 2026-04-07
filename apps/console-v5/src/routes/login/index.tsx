import { createFileRoute, redirect } from '@tanstack/react-router'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import { AuthEnum, useAuth } from '@qovery/shared/auth'
import { IconEnum } from '@qovery/shared/enums'
import { Badge, Button, Icon, InputTextSmall, Link } from '@qovery/shared/ui'
import { useLocalStorage } from '@qovery/shared/util-hooks'

const LAST_USED_LOGIN_STORAGE_KEY = 'lastUsedLogin'

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

const loginSearchParamsSchema = z.object({
  redirect: z.string().optional(),
})

function getSafeRedirect(redirectPath?: string) {
  if (!redirectPath || redirectPath.startsWith('/login')) {
    return '/'
  }

  return redirectPath
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
      Last used
    </Badge>
  )
}

interface Auth0Error {
  error: string
  error_description?: string
}

function useAuth0Error() {
  const [auth0Error, setAuth0Error] = useState<Auth0Error | null>(null)

  useEffect(() => {
    const error = sessionStorage.getItem('auth0_error')
    const errorDescription = sessionStorage.getItem('auth0_error_description')

    if (error) {
      setAuth0Error({
        error,
        error_description: errorDescription || 'NO_DESCRIPTION',
      })

      sessionStorage.removeItem('auth0_error')
      sessionStorage.removeItem('auth0_error_description')
    }
  }, [])

  return { auth0Error, setAuth0Error }
}

export const Route = createFileRoute('/login/')({
  validateSearch: loginSearchParamsSchema,
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: getSafeRedirect(search.redirect) })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { authLogin } = useAuth()
  const [ssoFormVisible, setSsoFormVisible] = useState(false)
  const { auth0Error, setAuth0Error } = useAuth0Error()
  const [loading, setLoading] = useState<{ provider: string; active: boolean } | undefined>()
  const [lastUsedLogin, setLastUsedLogin] = useLocalStorage<string | undefined>(LAST_USED_LOGIN_STORAGE_KEY, undefined)
  const [lastUsedLoginAtPageLoad] = useState(lastUsedLogin)

  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [isTestimonialExiting, setIsTestimonialExiting] = useState(true)
  const [shuffledTestimonials] = useState(() => shuffleArray(TESTIMONIALS))

  const [frontShotIndex, setFrontShotIndex] = useState(() =>
    PRODUCT_SHOTS.length > 0 ? Math.floor(Math.random() * PRODUCT_SHOTS.length) : 0
  )
  const [screenStackCycleKey, setScreenStackCycleKey] = useState(0)

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      ssoDomain: '',
    },
  })
  const ssoDomain = methods.watch('ssoDomain', '')

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

  const handleScreenStackFrontAnimationComplete = () => {
    setFrontShotIndex((previous) => (PRODUCT_SHOTS.length > 0 ? (previous + 1) % PRODUCT_SHOTS.length : 0))
    setScreenStackCycleKey((previous) => previous + 1)
  }

  const onClickAuthLogin = async (provider: string, lastUsedProvider = provider) => {
    setLoading({
      provider: provider,
      active: true,
    })

    setLastUsedLogin(lastUsedProvider)

    try {
      // XXX: Cleanup legacy jwtToken cookie which can cause RequestHeaderSectionTooLarge problems
      // https://qovery.atlassian.net/browse/FRT-1086
      // https://github.com/Qovery/console/pull/1188
      if (document.cookie.split(';').some((item) => item.trim().startsWith('jwtToken='))) {
        document.cookie = 'jwtToken=; Max-Age=-99999999; domain=.qovery.com'
      }
      await authLogin(provider)
    } catch (error) {
      console.error(error)
    }
  }

  const validateAndConnect = () => {
    const domainWithoutDots = methods.getValues('ssoDomain').trim().replace(/\./g, '')
    onClickAuthLogin(domainWithoutDots, 'saml_sso')
  }

  return (
    <div data-theme="light" className="relative min-h-screen w-screen overflow-x-hidden bg-background-secondary">
      <Link href="https://www.qovery.com" color="subtle" className="pointer-events-auto absolute left-4 top-4 z-modal">
        <Icon iconName="arrow-left" />
        Back to website
      </Link>

      <div className="relative mx-auto flex min-h-screen w-full lg:h-screen">
        <div className="relative z-modal flex w-full items-center justify-center px-2 sm:px-16 lg:flex-[1_1_0%] lg:px-10">
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
              <img className="mx-auto mb-8 h-6" src="/assets/logos/logo-black.svg" alt="Qovery logo black" />

              <h1
                className={clsx(
                  'text-center font-brand text-2xl font-normal leading-8 text-neutral',
                  ssoFormVisible ? 'mb-2' : 'mb-6'
                )}
              >
                {ssoFormVisible ? 'Enterprise single sign-on' : 'Connect to your workspace'}
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
                      Enter your company domain to connect with SSO
                    </motion.p>

                    <FormProvider {...methods}>
                      <div className="flex flex-col">
                        <Controller
                          name="ssoDomain"
                          control={methods.control}
                          rules={{
                            required: 'Please enter a domain.',
                            pattern: {
                              value:
                                /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/,
                              message: 'Invalid domain format',
                            },
                          }}
                          render={({ field, fieldState: { error } }) => (
                            <InputTextSmall
                              label="Company domain"
                              placeholder="Enter your domain (e.g., company.com)"
                              name={field.name}
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              error={error?.message}
                              className="[&_.input--small]:h-10 [&_.input--small]:min-h-10"
                              autoFocus
                            />
                          )}
                        />
                        <div className="mt-2 flex flex-col gap-2">
                          <Button
                            type="submit"
                            variant="solid"
                            color="brand"
                            size="lg"
                            className="relative w-full justify-center"
                            onClick={methods.handleSubmit(validateAndConnect)}
                            disabled={ssoDomain.trim().length === 0 || !methods.formState.isValid}
                          >
                            Connect
                          </Button>
                          <Button
                            onClick={() => {
                              setSsoFormVisible(false)
                              methods.reset()
                            }}
                            variant="plain"
                            color="neutral"
                            size="lg"
                            className="w-full justify-center"
                          >
                            Change login method
                          </Button>
                        </div>
                      </div>
                    </FormProvider>
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
                        className="relative w-full justify-center"
                        onClick={() => onClickAuthLogin(AuthEnum.GOOGLE_SSO)}
                        loading={loading?.provider === AuthEnum.GOOGLE_SSO ? loading.active : false}
                      >
                        <Icon
                          width="16"
                          className={clsx(
                            'mr-2 text-neutral-subtle',
                            loading?.provider === AuthEnum.GOOGLE_SSO && 'opacity-0'
                          )}
                          name={IconEnum.GOOGLE}
                        />
                        Continue with Google
                        <LastUsedBadge visible={lastUsedLoginAtPageLoad === AuthEnum.GOOGLE_SSO} />
                      </Button>

                      <Button
                        variant="solid"
                        color="neutral"
                        size="lg"
                        className="relative w-full justify-center"
                        onClick={() => onClickAuthLogin(AuthEnum.GITHUB)}
                        loading={loading?.provider === AuthEnum.GITHUB ? loading.active : false}
                      >
                        <Icon
                          width="16"
                          className={clsx(
                            'mr-2 text-neutralInvert',
                            loading?.provider === AuthEnum.GITHUB && 'opacity-0'
                          )}
                          fill="currentColor"
                          name={IconEnum.GITHUB_WHITE}
                        />
                        Continue with Github
                        <LastUsedBadge visible={lastUsedLoginAtPageLoad === AuthEnum.GITHUB} />
                      </Button>

                      <Button
                        variant="outline"
                        color="neutral"
                        size="lg"
                        className="relative w-full justify-center"
                        onClick={() => {
                          setLastUsedLogin('saml_sso')
                          setSsoFormVisible(true)
                          setAuth0Error(null)
                        }}
                      >
                        <Icon iconName="lock" className="mr-1.5 text-sm text-neutral-subtle" />
                        Continue with SAML SSO
                        <LastUsedBadge visible={lastUsedLoginAtPageLoad === 'saml_sso'} />
                      </Button>

                      <div className="my-2 flex items-center gap-4">
                        <div className="h-px flex-1 bg-surface-neutral-component" />
                        <span className="font-code text-xs uppercase tracking-wide text-neutral-subtle">OR</span>
                        <div className="h-px flex-1 bg-surface-neutral-component" />
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        <Button
                          variant="outline"
                          color="neutral"
                          size="lg"
                          className="relative justify-center"
                          onClick={() => onClickAuthLogin(AuthEnum.BITBUCKET)}
                          loading={loading?.provider === AuthEnum.BITBUCKET ? loading.active : false}
                        >
                          <Icon width="20" fill="currentColor" name={IconEnum.BITBUCKET} />
                          <LastUsedBadge visible={lastUsedLoginAtPageLoad === AuthEnum.BITBUCKET} />
                        </Button>
                        <Button
                          variant="outline"
                          color="neutral"
                          size="lg"
                          className="relative justify-center"
                          onClick={() => onClickAuthLogin(AuthEnum.GITLAB)}
                          loading={loading?.provider === AuthEnum.GITLAB ? loading.active : false}
                        >
                          <Icon width="20" fill="currentColor" name={IconEnum.GITLAB} />
                          <LastUsedBadge visible={lastUsedLoginAtPageLoad === AuthEnum.GITLAB} />
                        </Button>
                        <Button
                          variant="outline"
                          color="neutral"
                          size="lg"
                          className="relative justify-center"
                          onClick={() => onClickAuthLogin(AuthEnum.MICROSOFT)}
                          loading={loading?.provider === AuthEnum.MICROSOFT ? loading.active : false}
                        >
                          <Icon width="20" fill="currentColor" name={IconEnum.MICROSOFT} />
                          <LastUsedBadge visible={lastUsedLoginAtPageLoad === AuthEnum.MICROSOFT} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {auth0Error && (
                <div className="mt-4 rounded-md border border-negative-component bg-surface-negative-subtle p-3">
                  <p className="text-sm font-medium text-negative">{auth0Error.error}</p>
                  <p className="mt-1 text-sm text-neutral-subtle">{auth0Error.error_description}</p>
                </div>
              )}

              <p className="mt-6 text-center text-ssm text-neutral-subtle">
                By logging in or signing up, you agree to Qovery's{' '}
                <Link href="https://www.qovery.com/terms" className="font-normal" color="sky" size="ssm">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="https://www.qovery.com/privacy-policy" className="font-normal" color="sky" size="ssm">
                  Privacy Policy
                </Link>
              </p>
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
        </div>

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
            <img src="/assets/login/compliance-logos/soc2.png" alt="SOC 2 logo" className="h-12 w-12 object-contain" />
            <img src="/assets/login/compliance-logos/hipaa.png" alt="HIPAA logo" className="h-12 w-12 object-contain" />
            <img
              src="/assets/login/compliance-logos/aws-partner.png"
              alt="AWS Partner logo"
              className="h-12 w-12 object-contain"
            />
            <img src="/assets/login/compliance-logos/dora.png" alt="DORA logo" className="h-12 w-12 object-contain" />
            <img src="/assets/login/compliance-logos/gdpr.png" alt="GDPR logo" className="h-12 w-12 object-contain" />
          </div>
        </div>
      </div>
    </div>
  )
}
