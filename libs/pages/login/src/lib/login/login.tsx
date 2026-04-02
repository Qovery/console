import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { AuthEnum, useAuth } from '@qovery/shared/auth'
import { IconEnum } from '@qovery/shared/enums'
import { Button, Icon, InputText, Link } from '@qovery/shared/ui'
import useAuth0Error from '../hooks/auth0-error/use-auth0-error'

const LAST_USED_LOGIN_COOKIE_KEY = 'lastUsedLogin'

const CUBIC_BEZIER_EASE = [0.65, 0.05, 0.36, 1] as const
const SCREEN_STACK_MOVE_DURATION_S = 0.6
const SCREEN_STACK_REST_DURATION_S = 0.45
const SCREEN_STACK_OFFSET_PX = 16
const SCREEN_STACK_MIDDLE_OPACITY = 0.9
const SCREEN_STACK_BACK_OPACITY = 0.45
const PRODUCT_SHOTS = [
  '/assets/login/product-shots/Deployed%20and%20running.jpg',
  '/assets/login/product-shots/%5BProject%5D%20Overview.jpg',
  '/assets/login/product-shots/%5BApplication%5D%20Monitoring.jpg',
  '/assets/login/product-shots/%5BApplication%5D%20Service%20logs.jpg',
]

const TESTIMONIALS = [
  <>
    <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      <img src="/assets/login/testimonials-logo/alan.svg" alt="" aria-hidden className="h-full w-full object-contain" />
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
        alt=""
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
        alt=""
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
        alt=""
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
      <img src="/assets/login/testimonials-logo/tint.png" alt="" aria-hidden className="h-full w-full object-contain" />
    </span>
    <span className="text-center">
      <span className="text-neutral">Tint</span> has accelerated compliance by "weeks, if not months"
    </span>
  </>,
  <>
    <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      <img
        src="/assets/login/testimonials-logo/spiko.svg"
        alt=""
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

// shuffling testimonials and product images order on refresh
function shuffleArray<T>(values: T[]) {
  const shuffled = [...values]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// to store and display the last used badge
function getCookieValue(key: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined
  }

  const value = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${key}=`))
    ?.split('=')[1]

  return value ? decodeURIComponent(value) : undefined
}

function setCookieValue(key: string, value: string) {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`
}

function LastUsedBadge({ visible }: { visible: boolean }) {
  if (!visible) {
    return null
  }

  return (
    <span className="absolute -right-1.5 -top-1.5 rounded-md border border-positive-subtle bg-surface-positive-subtle px-1 py-0.5 text-xs font-medium text-positive">
      Last used
    </span>
  )
}

export function Login() {
  const { authLogin } = useAuth()
  const displayInvitation = false
  const [ssoFormVisible, setSsoFormVisible] = useState(false)
  const { auth0Error, setAuth0Error } = useAuth0Error()
  const [loading, setLoading] = useState<{ provider: string; active: boolean } | undefined>()
  const [lastUsedLogin] = useState<string | undefined>(() => getCookieValue(LAST_USED_LOGIN_COOKIE_KEY))

  // Testimonial animation state.
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [isTestimonialFadingOut, setIsTestimonialFadingOut] = useState(false)
  const [isTestimonialInstantReset, setIsTestimonialInstantReset] = useState(true)
  const [shuffledTestimonials] = useState(() => shuffleArray(TESTIMONIALS))
  const testimonialTimeoutRef = useRef<number | undefined>()

  // Screenshot stack animation state.
  const [frontShotIndex, setFrontShotIndex] = useState(() =>
    PRODUCT_SHOTS.length > 0 ? Math.floor(Math.random() * PRODUCT_SHOTS.length) : 0
  )
  const [isScreenStackExiting, setIsScreenStackExiting] = useState(false)
  const [isScreenStackInstantReset, setIsScreenStackInstantReset] = useState(true)
  const screenStackTimeoutRef = useRef<number | undefined>()

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      ssoDomain: '',
    },
  })

  // Cancel any pending timeout before scheduling the next exit.
  const clearTestimonialTimeout = () => {
    if (testimonialTimeoutRef.current) {
      window.clearTimeout(testimonialTimeoutRef.current)
    }
  }

  // After enter completes, keep the testimonial visible for a while then trigger exit.
  const scheduleTestimonialFadeOut = () => {
    clearTestimonialTimeout()
    testimonialTimeoutRef.current = window.setTimeout(() => {
      setIsTestimonialFadingOut(true)
    }, 5200)
  }

  // Animation lifecycle:
  // 1) Visible animation completes -> schedule delayed exit.
  // 2) Exit animation completes -> swap testimonial and start next enter.
  const handleTestimonialAnimationComplete = () => {
    if (isTestimonialFadingOut) {
      setTestimonialIndex((previous) =>
        shuffledTestimonials.length > 0 ? (previous + 1) % shuffledTestimonials.length : 0
      )
      setIsTestimonialFadingOut(false)
      return
    }

    if (isTestimonialInstantReset) {
      setIsTestimonialInstantReset(false)
    }

    scheduleTestimonialFadeOut()
  }

  const clearScreenStackTimeout = () => {
    if (screenStackTimeoutRef.current) {
      window.clearTimeout(screenStackTimeoutRef.current)
    }
  }

  const scheduleScreenStackExit = () => {
    clearScreenStackTimeout()
    screenStackTimeoutRef.current = window.setTimeout(() => {
      setIsScreenStackExiting(true)
    }, 8000)
  }

  const getScreenStackRestTransitionDuration = () => {
    if (isScreenStackInstantReset) return 0
    return SCREEN_STACK_REST_DURATION_S
  }

  // The front layer drives the stack cycle:
  // - when exit ends, swap the front image and reset instantly to rest positions;
  // - when rest settles, schedule next exit.
  const handleScreenStackFrontAnimationComplete = () => {
    if (isScreenStackExiting) {
      setFrontShotIndex((previous) => (PRODUCT_SHOTS.length > 0 ? (previous + 1) % PRODUCT_SHOTS.length : 0))
      setIsScreenStackInstantReset(true)
      setIsScreenStackExiting(false)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsScreenStackInstantReset(false)
          scheduleScreenStackExit()
        })
      })
      return
    }
    scheduleScreenStackExit()
  }

  const onClickAuthLogin = async (provider: string, lastUsedProvider = provider) => {
    setLoading({
      provider: provider,
      active: true,
    })

    setCookieValue(LAST_USED_LOGIN_COOKIE_KEY, lastUsedProvider)

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
      <Link
        href="https://www.qovery.com"
        color="subtle"
        className="pointer-events-auto absolute left-4 top-4 z-30 lg:left-6 lg:top-5"
      >
        <Icon iconName="arrow-left" />
        Back to website
      </Link>

      <div className="relative mx-auto flex min-h-screen w-full lg:h-screen">
        <div className="relative z-20 flex w-full items-center justify-center px-2 sm:px-16 lg:flex-[1_1_0%] lg:px-8">
          <div className="w-full max-w-[480px] rounded-2xl border border-neutral bg-surface-neutral-subtle shadow-[0_2px_5px_0_rgba(0,0,0,0.02),0_0_24px_0_rgba(0,0,0,0.04)] lg:min-w-[480px]">
            <div className="rounded-2xl bg-background px-4 pb-4 pt-9 outline outline-[1px] outline-neutral sm:px-8 sm:pb-6">
              <img className="mx-auto mb-9 h-8" src="/assets/logos/logo-black.svg" alt="Qovery logo black" />

              {!displayInvitation ? (
                <h1
                  className={`font-brand text-center text-2xl font-normal leading-[32px] text-neutral sm:text-[28px] sm:leading-[36px] ${ssoFormVisible ? 'mb-2' : 'mb-8'}`}
                >
                  {ssoFormVisible ? 'Enterprise single sign-on' : 'Connect to your workspace'}
                </h1>
              ) : (
                <div className="mb-2">{/* <InviteDetailsFeature /> */}</div>
              )}

              {ssoFormVisible && (
                <p className="mb-8 text-center text-base text-neutral-subtle">
                  Enter your company domain to connect with SSO
                </p>
              )}

              {!ssoFormVisible ? (
                <div className="flex flex-col gap-3">
                  <Button
                    variant="outline"
                    color="neutral"
                    size="lg"
                    className="relative h-12 w-full justify-center text-base"
                    onClick={() => onClickAuthLogin(AuthEnum.GOOGLE_SSO)}
                    loading={loading?.provider === AuthEnum.GOOGLE_SSO ? loading.active : false}
                  >
                    <Icon
                      width="20"
                      className={`mr-3 ${loading?.provider === AuthEnum.GOOGLE_SSO ? 'opacity-0' : ''} text-neutral-subtle`}
                      name={IconEnum.GOOGLE}
                    />
                    Continue with Google
                    <LastUsedBadge visible={lastUsedLogin === AuthEnum.GOOGLE_SSO} />
                  </Button>

                  <Button
                    variant="solid"
                    color="neutral"
                    size="lg"
                    className="relative h-12 w-full justify-center text-base"
                    onClick={() => onClickAuthLogin(AuthEnum.GITHUB)}
                    loading={loading?.provider === AuthEnum.GITHUB ? loading.active : false}
                  >
                    <Icon
                      width="20"
                      className={`mr-3 ${loading?.provider === AuthEnum.GITHUB ? 'opacity-0' : ''} text-neutralInvert`}
                      fill="currentColor"
                      name={IconEnum.GITHUB_WHITE}
                    />
                    Continue with Github
                    <LastUsedBadge visible={lastUsedLogin === AuthEnum.GITHUB} />
                  </Button>

                  <Button
                    variant="outline"
                    color="neutral"
                    size="lg"
                    className="relative h-12 w-full justify-center text-base"
                    onClick={() => {
                      setCookieValue(LAST_USED_LOGIN_COOKIE_KEY, 'saml_sso')
                      setSsoFormVisible(true)
                      setAuth0Error(null)
                    }}
                  >
                    <Icon iconName="lock" className="mr-3 text-sm text-neutral-subtle" />
                    Continue with SAML SSO
                    <LastUsedBadge visible={lastUsedLogin === 'saml_sso'} />
                  </Button>

                  <div className="my-2 flex items-center gap-4">
                    <div className="h-px flex-1 bg-surface-neutral-component" />
                    <span className="font-code text-xs uppercase tracking-wide text-neutral-subtle">OR</span>
                    <div className="h-px flex-1 bg-surface-neutral-component" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      color="neutral"
                      size="lg"
                      className="relative h-12 justify-center text-base"
                      onClick={() => onClickAuthLogin(AuthEnum.BITBUCKET)}
                      loading={loading?.provider === AuthEnum.BITBUCKET ? loading.active : false}
                    >
                      <Icon width="20" fill="currentColor" name={IconEnum.BITBUCKET} />
                      <LastUsedBadge visible={lastUsedLogin === AuthEnum.BITBUCKET} />
                    </Button>
                    <Button
                      variant="outline"
                      color="neutral"
                      size="lg"
                      className="relative h-12 justify-center text-base"
                      onClick={() => onClickAuthLogin(AuthEnum.GITLAB)}
                      loading={loading?.provider === AuthEnum.GITLAB ? loading.active : false}
                    >
                      <Icon width="20" fill="currentColor" name={IconEnum.GITLAB} />
                      <LastUsedBadge visible={lastUsedLogin === AuthEnum.GITLAB} />
                    </Button>
                    <Button
                      variant="outline"
                      color="neutral"
                      size="lg"
                      className="relative h-12 justify-center text-base"
                      onClick={() => onClickAuthLogin(AuthEnum.MICROSOFT)}
                      loading={loading?.provider === AuthEnum.MICROSOFT ? loading.active : false}
                    >
                      <Icon width="20" fill="currentColor" name={IconEnum.MICROSOFT} />
                      <LastUsedBadge visible={lastUsedLogin === AuthEnum.MICROSOFT} />
                    </Button>
                  </div>
                </div>
              ) : (
                <FormProvider {...methods}>
                  <div className="flex flex-col">
                    <Controller
                      name="ssoDomain"
                      control={methods.control}
                      rules={{
                        required: 'Please enter a domain.',
                        pattern: {
                          value: /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/,
                          message: 'Invalid domain format',
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputText
                          label="Company domain"
                          name={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          error={error?.message}
                        />
                      )}
                    />
                    <div className="mt-2 flex flex-col gap-2">
                      <Button
                        type="submit"
                        variant="solid"
                        color="brand"
                        size="lg"
                        className="relative h-12 w-full justify-center text-base"
                        onClick={methods.handleSubmit(validateAndConnect)}
                        disabled={!methods.formState.isValid}
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
              )}

              {auth0Error && (
                <div className="mt-4 rounded-md border border-negative-component bg-surface-negative-subtle p-3">
                  <p className="text-sm font-medium text-negative">{auth0Error.error}</p>
                  <p className="mt-1 text-sm text-neutral-subtle">{auth0Error.error_description}</p>
                </div>
              )}

              <p className="mt-6 text-center text-ssm text-neutral-subtle">
                By logging in or signing up, you agree to Qovery&apos;s{' '}
                <Link
                  href="https://www.qovery.com/terms"
                  className="inline font-normal text-info hover:text-info-hover"
                  size="ssm"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="https://www.qovery.com/privacy-policy"
                  className="inline font-normal text-info hover:text-info-hover"
                  size="ssm"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>

            <motion.div
              key={testimonialIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={
                isTestimonialFadingOut
                  ? {
                      opacity: 0,
                      y: -8,
                      transition: { duration: 0.4, ease: [0.55, 0.085, 0.68, 0.53] },
                    }
                  : {
                      opacity: 1,
                      y: 0,
                      transition: { duration: isTestimonialInstantReset ? 0 : 0.5, ease: 'easeOut' },
                    }
              }
              onAnimationComplete={handleTestimonialAnimationComplete}
              className="flex items-center justify-center gap-2 px-4 py-4 text-sm text-neutral-subtle"
            >
              {shuffledTestimonials[testimonialIndex]}
            </motion.div>
          </div>
        </div>

        <div className="relative z-0 hidden lg:block lg:h-screen lg:max-w-[1280px] lg:flex-[2_1_0%]">
          <img
            src="/assets/login/onboarding-background.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-0 z-0 h-full w-auto max-w-none"
          />

          <div className="absolute inset-0 z-10 [-webkit-mask-image:radial-gradient(225.19%_100%_at_50%_0%,#D9D9D9_72%,rgba(217,217,217,0)_88%)] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%] [mask-image:radial-gradient(225.19%_100%_at_50%_0%,#D9D9D9_72%,rgba(217,217,217,0)_88%)] [mask-repeat:no-repeat] [mask-size:100%_100%]">
            <div className="relative ml-32 mt-12 aspect-[2940/2080] h-[80%] skew-x-[15deg]">
              {/* Framer Motion stack choreography:
                  1) Front exits to top-right and fades out.
                  2) Next screenshot fades in on the same path while the white middle layer is promoted.
                  3) White back layer is promoted to middle (offset -32,+32 -> -16,+16, opacity -> 0.9).
                  4) White incoming layer appears (offset -48,+48 -> -32,+32, opacity 0 -> 0.45).
                  Only the front slot renders a screenshot. */}
              <motion.img
                src={PRODUCT_SHOTS[frontShotIndex]}
                alt=""
                aria-hidden
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={
                  isScreenStackExiting
                    ? {
                        x: SCREEN_STACK_OFFSET_PX,
                        y: -SCREEN_STACK_OFFSET_PX,
                        opacity: 0,
                        transition: { duration: SCREEN_STACK_MOVE_DURATION_S, ease: CUBIC_BEZIER_EASE },
                      }
                    : {
                        x: 0,
                        y: 0,
                        opacity: 1,
                        transition: {
                          duration: getScreenStackRestTransitionDuration(),
                          ease: CUBIC_BEZIER_EASE,
                        },
                      }
                }
                onAnimationComplete={handleScreenStackFrontAnimationComplete}
                className="absolute left-0 top-0 z-40 h-full rounded-2xl shadow-[0_0_25px_0_rgba(0,0,0,0.04),0_2px_5px_0_rgba(0,0,0,0.02)]"
              />
              {isScreenStackExiting && (
                <motion.img
                  key={`incoming-front-${frontShotIndex}`}
                  src={PRODUCT_SHOTS[(frontShotIndex + 1) % PRODUCT_SHOTS.length]}
                  alt=""
                  aria-hidden
                  initial={{ x: -SCREEN_STACK_OFFSET_PX, y: SCREEN_STACK_OFFSET_PX, opacity: 0 }}
                  animate={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                    transition: { duration: SCREEN_STACK_MOVE_DURATION_S, ease: CUBIC_BEZIER_EASE },
                  }}
                  className="absolute left-0 top-0 z-[35] h-full rounded-2xl"
                />
              )}
              <motion.div
                initial={{
                  x: -SCREEN_STACK_OFFSET_PX,
                  y: SCREEN_STACK_OFFSET_PX,
                  opacity: SCREEN_STACK_MIDDLE_OPACITY,
                }}
                animate={
                  isScreenStackExiting
                    ? {
                        x: 0,
                        y: 0,
                        opacity: 1,
                        transition: { duration: SCREEN_STACK_MOVE_DURATION_S, ease: CUBIC_BEZIER_EASE },
                      }
                    : {
                        x: -SCREEN_STACK_OFFSET_PX,
                        y: SCREEN_STACK_OFFSET_PX,
                        opacity: SCREEN_STACK_MIDDLE_OPACITY,
                        transition: { duration: getScreenStackRestTransitionDuration(), ease: CUBIC_BEZIER_EASE },
                      }
                }
                className="absolute left-0 top-0 z-30 h-full w-full rounded-2xl bg-surface-neutral shadow-[0_0_25px_0_rgba(0,0,0,0.04),0_2px_5px_0_rgba(0,0,0,0.02)]"
              />
              <motion.div
                initial={{
                  x: -2 * SCREEN_STACK_OFFSET_PX,
                  y: 2 * SCREEN_STACK_OFFSET_PX,
                  opacity: SCREEN_STACK_BACK_OPACITY,
                }}
                animate={
                  isScreenStackExiting
                    ? {
                        x: -SCREEN_STACK_OFFSET_PX,
                        y: SCREEN_STACK_OFFSET_PX,
                        opacity: SCREEN_STACK_MIDDLE_OPACITY,
                        transition: { duration: SCREEN_STACK_MOVE_DURATION_S, ease: CUBIC_BEZIER_EASE },
                      }
                    : {
                        x: -2 * SCREEN_STACK_OFFSET_PX,
                        y: 2 * SCREEN_STACK_OFFSET_PX,
                        opacity: SCREEN_STACK_BACK_OPACITY,
                        transition: { duration: getScreenStackRestTransitionDuration(), ease: CUBIC_BEZIER_EASE },
                      }
                }
                className="absolute left-0 top-0 z-20 h-full w-full rounded-2xl bg-surface-neutral shadow-[0_0_25px_0_rgba(0,0,0,0.04),0_2px_5px_0_rgba(0,0,0,0.02)]"
              />
              <motion.div
                initial={{ x: -3 * SCREEN_STACK_OFFSET_PX, y: 3 * SCREEN_STACK_OFFSET_PX, opacity: 0 }}
                animate={
                  isScreenStackExiting
                    ? {
                        x: -2 * SCREEN_STACK_OFFSET_PX,
                        y: 2 * SCREEN_STACK_OFFSET_PX,
                        opacity: SCREEN_STACK_BACK_OPACITY,
                        transition: { duration: SCREEN_STACK_MOVE_DURATION_S, ease: CUBIC_BEZIER_EASE },
                      }
                    : {
                        x: -3 * SCREEN_STACK_OFFSET_PX,
                        y: 3 * SCREEN_STACK_OFFSET_PX,
                        opacity: 0,
                        transition: { duration: getScreenStackRestTransitionDuration(), ease: CUBIC_BEZIER_EASE },
                      }
                }
                className="absolute left-0 top-0 z-10 h-full w-full rounded-2xl bg-surface-neutral shadow-[0_0_25px_0_rgba(0,0,0,0.04),0_2px_5px_0_rgba(0,0,0,0.02)]"
              />
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-6">
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

export default Login
