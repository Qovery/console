import { createFileRoute, redirect } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth0Error } from '@qovery/pages/login'
import { AuthEnum, useAuth } from '@qovery/shared/auth'
import { IconEnum } from '@qovery/shared/enums'
import { Button, Icon, InputTextSmall, Link } from '@qovery/shared/ui'

const LAST_USED_LOGIN_COOKIE_KEY = 'lastUsedLogin'
const SAML_LOGIN_VALUE = 'saml_sso'

const TESTIMONIALS = [
  'Alan deployment times went from 55 minutes to 8 minutes',
  'Talkspace standardized environments across product teams with Qovery',
  'Red Bull reduced platform operations overhead for internal developers',
  'Contentful teams ship infrastructure changes faster with Qovery',
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
    <span className="absolute -right-1 -top-1 rounded-md border border-positive-subtle bg-surface-positive-subtle px-1 py-0.5 text-xs font-medium text-positive">
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
  const [testimonialIndex, setTestimonialIndex] = useState(0)

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      ssoDomain: '',
    },
  })

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTestimonialIndex((previous) => (previous + 1) % TESTIMONIALS.length)
    }, 2600)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

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
    onClickAuthLogin(domainWithoutDots, SAML_LOGIN_VALUE)
  }

  return (
    <div data-theme="light" className="relative min-h-screen overflow-hidden bg-background-secondary">
      <div className="pointer-events-none absolute inset-0 bg-surface-brand-subtle opacity-40" />

      <a
        href="https://www.qovery.com"
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 text-sm text-neutral-subtle transition-colors hover:text-neutral lg:left-6 lg:top-5"
      >
        <Icon iconName="arrow-left" className="text-xs" />
        Back to website
      </a>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] items-center gap-8 px-4 py-20 lg:px-16">
        <div className="w-full max-w-[480px] rounded-2xl border border-neutral bg-surface-neutral-subtle shadow-lg">
          <div className="rounded-2xl bg-background px-8 pb-6 pt-9 outline outline-[1px] outline-neutral">
            <img className="mx-auto mb-8 w-[104px]" src="/assets/logos/logo-black.svg" alt="Qovery logo black" />

            {!displayInvitation ? (
              <h1 className="mb-8 text-center font-brand text-[28px] font-normal leading-[36px] text-neutral">
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
                    setCookieValue(LAST_USED_LOGIN_COOKIE_KEY, SAML_LOGIN_VALUE)
                    setSsoFormVisible(true)
                    setAuth0Error(null)
                  }}
                >
                  <Icon iconName="lock" className="mr-3 text-sm text-neutral-subtle" />
                  Continue with SAML SSO
                  <LastUsedBadge visible={lastUsedLogin === SAML_LOGIN_VALUE} />
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
                    className="h-12 justify-center text-base"
                    onClick={() => onClickAuthLogin(AuthEnum.BITBUCKET)}
                    loading={loading?.provider === AuthEnum.BITBUCKET ? loading.active : false}
                  >
                    <Icon width="20" fill="currentColor" name={IconEnum.BITBUCKET} />
                  </Button>
                  <Button
                    variant="outline"
                    color="neutral"
                    size="lg"
                    className="h-12 justify-center text-base"
                    onClick={() => onClickAuthLogin(AuthEnum.GITLAB)}
                    loading={loading?.provider === AuthEnum.GITLAB ? loading.active : false}
                  >
                    <Icon width="20" fill="currentColor" name={IconEnum.GITLAB} />
                  </Button>
                  <Button
                    variant="outline"
                    color="neutral"
                    size="lg"
                    className="h-12 justify-center text-base"
                    onClick={() => onClickAuthLogin(AuthEnum.MICROSOFT)}
                    loading={loading?.provider === AuthEnum.MICROSOFT ? loading.active : false}
                  >
                    <Icon width="20" fill="currentColor" name={IconEnum.MICROSOFT} />
                  </Button>
                </div>
              </div>
            ) : (
              <FormProvider {...methods}>
                <div className="flex flex-col">
                  <h2 className="text-lg text-neutral">Enterprise Single Sign-On</h2>
                  <p className="mb-5 mt-1 text-sm text-neutral-subtle">Enter your company domain to connect with SSO</p>
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

            <p className="mt-6 text-center text-[13px] text-neutral-subtle">
              By logging in or signing up, you agree to Qovery&apos;s{' '}
              <Link href="https://www.qovery.com/terms" className="inline text-info hover:text-info-hover">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="https://www.qovery.com/terms" className="inline text-info hover:text-info-hover">
                Privacy Policy
              </Link>
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 px-4 py-4 text-sm text-neutral-subtle">
            <Icon iconName="quote-left" className="text-xs" />
            <p key={testimonialIndex} className="text-center motion-safe:animate-[fadein_250ms_ease-in-out]">
              {TESTIMONIALS[testimonialIndex]}
            </p>
          </div>
        </div>

        <div className="hidden h-[720px] flex-1 skew-x-15 rounded-2xl bg-red-500 lg:block" />
      </div>
    </div>
  )
}

function RouteComponent() {
  return <Login />
}
