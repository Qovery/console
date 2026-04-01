import { createFileRoute, redirect } from '@tanstack/react-router'
import { type AnimationEvent, useRef, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth0Error } from '@qovery/pages/login'
import { AuthEnum, useAuth } from '@qovery/shared/auth'
import { IconEnum } from '@qovery/shared/enums'
import { Button, Icon, InputTextSmall, Link } from '@qovery/shared/ui'

const LAST_USED_LOGIN_COOKIE_KEY = 'lastUsedLogin'
// Time each testimonial stays fully visible before starting exit animation.
const TESTIMONIAL_DISPLAY_DURATION_MS = 5200
// Enter from below + fade in.
const TESTIMONIAL_ENTER_ANIMATION_CLASS = 'animate-[500ms_ease-out_0s_slidein-up-md,500ms_ease-out_0s_fadein]'
// Exit to top + fade out.
const TESTIMONIAL_EXIT_ANIMATION_CLASS =
  'animate-[400ms_cubic-bezier(0.55,_0.085,_0.68,_0.53)_0s_slideout-up-md,400ms_cubic-bezier(0.55,_0.085,_0.68,_0.53)_0s_fadeout]'

const TESTIMONIALS = [
  <>
    <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      <img
        src="/assets/login/testimonials-logo/frame.svg"
        alt=""
        aria-hidden
        className="h-full w-full object-contain"
      />
    </span>
    <span className="text-center">
      <span className="text-neutral">Alan</span> deployment times went from 55 minutes to 8 minutes
    </span>
  </>,
  <>
    <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      <img
        src="/assets/login/testimonials-logo/frame.svg"
        alt=""
        aria-hidden
        className="h-full w-full object-contain"
      />
    </span>
    <span className="text-center">
      <span className="text-neutral">Talkspace</span> standardized team environments with Qovery
    </span>
  </>,
  <>
    <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      <img
        src="/assets/login/testimonials-logo/frame.svg"
        alt=""
        aria-hidden
        className="h-full w-full object-contain"
      />
    </span>
    <span className="text-center">
      <span className="text-neutral">Alan</span> deployment times went from 55 minutes to 8 minutes
    </span>
  </>,
  <>
    <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      <img
        src="/assets/login/testimonials-logo/frame.svg"
        alt=""
        aria-hidden
        className="h-full w-full object-contain"
      />
    </span>
    <span className="text-center">
      <span className="text-neutral">Alan</span> deployment times went from 55 minutes to 8 minutes
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

export const Route = createFileRoute('/login/')({
  validateSearch: loginSearchParamsSchema,
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: getSafeRedirect(search.redirect) })
    }
  },
  component: RouteComponent,
})

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
  const testimonialTimeoutRef = useRef<number | undefined>()

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
    }, TESTIMONIAL_DISPLAY_DURATION_MS)
  }

  // Animation lifecycle:
  // 1) Enter animation ends -> schedule delayed exit.
  // 2) Exit animation ends -> swap testimonial and start next enter.
  const handleTestimonialAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return
    }

    if (isTestimonialFadingOut && event.animationName !== 'fadeout') {
      return
    }

    if (!isTestimonialFadingOut && event.animationName !== 'fadein') {
      return
    }

    if (isTestimonialFadingOut) {
      setTestimonialIndex((previous) => (previous + 1) % TESTIMONIALS.length)
      setIsTestimonialFadingOut(false)
      return
    }

    scheduleTestimonialFadeOut()
  }

  const testimonialAnimationClass = isTestimonialFadingOut
    ? TESTIMONIAL_EXIT_ANIMATION_CLASS
    : TESTIMONIAL_ENTER_ANIMATION_CLASS

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
    <div data-theme="light" className="relative min-h-screen overflow-hidden bg-background-secondary">
      <Link href="https://www.qovery.com" color="subtle" className="absolute left-4 top-4 z-20 lg:left-6 lg:top-5">
        <Icon iconName="arrow-left" />
        Back to website
      </Link>

      <div className="relative mx-auto flex min-h-screen w-full">
        <div className="relative z-20 flex items-center justify-center px-16 lg:flex-[1_1_0%]">
          <div className="w-full min-w-[480px] max-w-[480px] rounded-2xl border border-neutral bg-surface-neutral-subtle shadow-[0_2px_5px_0_rgba(0,0,0,0.02),0_0_24px_0_rgba(0,0,0,0.04)]">
            <div className="rounded-2xl bg-background px-8 pb-6 pt-9 outline outline-[1px] outline-neutral">
              <img className="mx-auto mb-9 h-8" src="/assets/logos/logo-black.svg" alt="Qovery logo black" />

              {!displayInvitation ? (
                <h1 className="font-brand mb-8 text-center text-[28px] font-normal leading-[36px] text-neutral">
                  Connect to your workspace
                </h1>
              ) : (
                <div className="mb-2">{/* <InviteDetailsFeature /> */}</div>
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
                    <h2 className="text-lg text-neutral">Enterprise Single Sign-On</h2>
                    <p className="mb-5 mt-1 text-sm text-neutral-subtle">
                      Enter your company domain to connect with SSO
                    </p>
                    <div className="flex items-start gap-2">
                      <div className="relative flex-1 items-center">
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
                              placeholder="Enter your domain (e.g., company.com)"
                              name={field.name}
                              value={field.value}
                              onChange={field.onChange}
                              error={error?.message}
                            />
                          )}
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="solid"
                        color="brand"
                        size="md"
                        className="h-9"
                        onClick={methods.handleSubmit(validateAndConnect)}
                        disabled={!methods.formState.isValid}
                      >
                        Connect
                      </Button>
                    </div>

                    <Link
                      onClick={() => {
                        setSsoFormVisible(false)
                        methods.reset()
                      }}
                      className="mt-6 flex max-w-max gap-1"
                      color="sky"
                    >
                      <Icon iconName="arrow-left" />
                      Go back
                    </Link>
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

            <div
              className={`flex items-center justify-center gap-3 px-4 py-4 text-sm text-neutral-subtle [animation-fill-mode:both] ${testimonialAnimationClass}`}
              onAnimationEnd={handleTestimonialAnimationEnd}
            >
              {TESTIMONIALS[testimonialIndex]}
            </div>
          </div>
        </div>

        <div className="relative z-0 hidden lg:block lg:max-w-[1280px] lg:flex-[2_1_0%]">
          <div className="relative h-full w-full overflow-visible">
            <img
              src="/assets/login/onboarding-background.svg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute bottom-0 right-0 z-0 h-auto w-[1440px] max-w-none"
            />

            <div className="relative z-10 ml-20 mt-12 h-[80%] aspect-[2940/2080] skew-x-[15deg]">
              <div className="absolute inset-0 -translate-x-8 translate-y-8 rounded-2xl bg-surface-neutral opacity-30 shadow-[0_0_25px_0_rgba(0,0,0,0.04),0_2px_5px_0_rgba(0,0,0,0.02)]" />
              <div className="absolute inset-0 -translate-x-4 translate-y-4 rounded-2xl bg-surface-neutral opacity-80 shadow-[0_0_25px_0_rgba(0,0,0,0.04),0_2px_5px_0_rgba(0,0,0,0.02)]" />
              <img
                src="/assets/login/product-shots/Deployed%20and%20running.jpg"
                alt=""
                aria-hidden
                className="relative h-full rounded-2xl shadow-[0_0_25px_0_rgba(0,0,0,0.04),0_2px_5px_0_rgba(0,0,0,0.02)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RouteComponent() {
  return <Login />
}
