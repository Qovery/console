import { CardCVV, CardComponent, CardExpiry, CardNumber, Provider } from '@chargebee/chargebee-js-react-wrapper'
import type FieldContainer from '@chargebee/chargebee-js-react-wrapper/dist/components/FieldContainer'
import type CbInstance from '@chargebee/chargebee-js-types/cb-types/models/cb-instance'
import { useNavigate, useRouter } from '@tanstack/react-router'
import clsx from 'clsx'
import { type FormEvent, type MutableRefObject, useMemo } from 'react'
import { ENVIRONMENTS_URL } from '@qovery/shared/routes'
import { Button, ExternalLink, Heading, Icon, LoaderSpinner, Section } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { fieldCardStyles } from '@qovery/shared/util-payment'
import { Background } from './background'

export interface SelectedPlanSummary {
  title: string
  price: number | 'custom'
  list?: string[]
}

export interface StepPlansProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  selectedPlan: SelectedPlanSummary
  onChangePlan: () => void
  authLogout: () => void
  backButton?: boolean
  cbInstance: CbInstance | null
  cardRef: MutableRefObject<FieldContainer | null>
  onCardReady: () => void
  isCardReady: boolean
  isSubmitting: boolean
}

export default function StepPlans(props: StepPlansProps) {
  const router = useRouter()
  const {
    onSubmit,
    selectedPlan,
    onChangePlan,
    backButton,
    cbInstance,
    cardRef,
    onCardReady,
    isCardReady,
    isSubmitting,
  } = props
  const navigate = useNavigate()
  const currentOrganizationId = localStorage.getItem('currentOrganizationId') || ''
  const currentProjectId = localStorage.getItem('currentProjectId') || ''

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
      }),
    []
  )

  const trialReminderDate = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + 12)
    return dateFormatter.format(date)
  }, [dateFormatter])

  const welcomeOnboardDate = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + 14)
    return dateFormatter.format(date)
  }, [dateFormatter])

  const getSelectedPlanPrice = () => {
    if (selectedPlan.price === 'custom') return 'Custom pricing'
    if (selectedPlan.price === 0) return 'Free'
    return `$${selectedPlan.price} / month`
  }

  const showCardFields = cbInstance !== null

  return (
    <Section className="mx-auto flex max-w-[1024px] flex-row gap-16">
      <div className="relative flex flex-1 flex-col">
        <div
          className={twMerge(
            clsx('absolute inset-0 flex items-center justify-center', {
              'hidden opacity-0': isCardReady,
              'opacity-100': !isCardReady,
            })
          )}
        >
          <LoaderSpinner classWidth="w-6 h-6" />
        </div>
        <div
          className={twMerge(
            clsx('flex flex-1 flex-col py-8 opacity-100 transition-opacity duration-75', {
              'opacity-0': !isCardReady,
            })
          )}
        >
          <Heading level={1} className="mb-3 text-neutral">
            Start with a 14-days free trial
          </Heading>
          <p className="mb-10 text-sm text-neutral">
            Try Qovery with a 14-days trial, without payment.{' '}
            <span className="font-medium">You’ll not be charged today.</span>
          </p>
          <form onSubmit={onSubmit} className="flex flex-1 flex-col">
            <div className="mb-8">
              {!showCardFields && (
                <div className="rounded-md border border-neutral bg-white p-4 text-sm text-neutral-subtle">
                  Preparing secure card fields...
                </div>
              )}
              {showCardFields && (
                <Provider cbInstance={cbInstance}>
                  <CardComponent
                    ref={cardRef}
                    styles={fieldCardStyles()}
                    locale="en"
                    currency="USD"
                    onReady={onCardReady}
                  >
                    <div className="chargebee-field-wrapper">
                      <label className="chargebee-field-label">Card Number</label>
                      <CardNumber placeholder="1234 1234 1234 1234" />
                    </div>
                    <div className="chargebee-fields-row">
                      <div className="chargebee-field-wrapper">
                        <label className="chargebee-field-label">Expiry</label>
                        <CardExpiry placeholder="MM / YY" />
                      </div>
                      <div className="chargebee-field-wrapper">
                        <label className="chargebee-field-label">CVV</label>
                        <CardCVV placeholder="CVV" />
                      </div>
                    </div>
                  </CardComponent>
                </Provider>
              )}
            </div>
            <div className="mb-4 rounded-lg border border-brand-subtle bg-surface-brand-subtle p-4 text-neutral lg:hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral">{selectedPlan.title}</p>
                  <p className="text-sm text-brand">{getSelectedPlanPrice()}</p>
                </div>
                <button type="button" className="text-sm text-neutral-subtle underline" onClick={onChangePlan}>
                  Change plan
                </button>
              </div>
            </div>
            <div className="mt-auto">
              <p>
                You have specific needs?{' '}
                <ExternalLink
                  href="https://meetings-eu1.hubspot.com/hakob-hakobian/free-trial-contact-sales"
                  color="sky"
                  withIcon={false}
                  className="gap-1 text-base font-normal"
                >
                  Book a demo
                </ExternalLink>{' '}
                with us and unlock a trial that truly suits you.
              </p>
              <div className="mt-4 flex justify-between border-t border-neutral pt-5">
                {!backButton ? (
                  <Button
                    type="button"
                    size="lg"
                    color="neutral"
                    variant="surface"
                    className="gap-2"
                    onClick={() => navigate({ to: '/onboarding/personalize' })}
                  >
                    <Icon iconName="arrow-left" iconStyle="solid" />
                    Back
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="lg"
                    color="neutral"
                    variant="surface"
                    className="gap-2"
                    onClick={() => {
                      if (currentOrganizationId) {
                        navigate({ to: ENVIRONMENTS_URL(currentOrganizationId, currentProjectId) })
                      } else {
                        router.history.back()
                      }
                    }}
                  >
                    <Icon iconName="arrow-left" iconStyle="solid" />
                    Back
                  </Button>
                )}
                <Button type="submit" size="lg" loading={isSubmitting}>
                  Start my 14-days free trial
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="relative hidden flex-1 overflow-hidden rounded-lg border border-brand-subtle lg:block">
        <Background />

        <div className="relative p-8">
          <h2 className="h4 mb-6 text-center text-neutral">
            Make the most out of Qovery with our <span className="text-brand">14-days free trial</span>
          </h2>
          <div className="rounded-md border border-brand-subtle bg-white">
            <div className="flex border-b p-6">
              <div className="mr-4 flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-brand-solid text-white">
                  <Icon iconName="rocket" iconStyle="regular" className="text-sm" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="w-2 flex-1 rounded-b-full bg-surface-brand-solid"></div>
                  <div className="w-2 flex-1 bg-surface-brand-subtle"></div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-brand-subtle text-brand">
                  <Icon iconName="calendar" iconStyle="regular" className="text-sm" />
                </div>
                <div className="w-2 flex-1 bg-surface-brand-subtle"></div>
                <div className="mb-7 flex h-8 w-8 items-center justify-center rounded-md bg-surface-brand-subtle text-brand">
                  <Icon iconName="crown" iconStyle="regular" className="text-sm" />
                </div>
              </div>
              <div>
                <div className="mb-8">
                  <h3 className="mb-1 text-sm font-medium text-neutral">
                    Today: Start you trial and deploy your first app
                  </h3>
                  <p className="text-ssm font-normal text-neutral-subtle">
                    Access to the full extend of our features with your dedicated Qovery plan.
                  </p>
                </div>
                <div className="mb-8">
                  <h3 className="mb-1 text-sm font-medium text-neutral">{trialReminderDate}: Approaching trial end </h3>
                  <p className="text-ssm font-normal text-neutral-subtle">
                    Take a moment to review your setup before moving to your full plan. Your remaining days are always
                    visible.
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-medium text-neutral">{welcomeOnboardDate}: Welcome onboard! </h3>
                  <p className="text-ssm font-normal text-neutral-subtle">
                    Your subscription will start automatically. You can cancel at anytime.{' '}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-neutral">{selectedPlan.title}</p>
                  <p className="mb-2 text-sm text-brand">{getSelectedPlanPrice()}</p>
                  <button type="button" className="text-sm text-neutral-subtle underline" onClick={onChangePlan}>
                    Change plan
                  </button>
                </div>
                <div>
                  {selectedPlan.list &&
                    selectedPlan.list.slice(0, 4).map((item) => (
                      <div key={item} className="mb-1 flex items-center text-sm text-neutral">
                        <Icon iconName="circle-check" iconStyle="regular" className="mr-2 text-green-500" />
                        {item}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
