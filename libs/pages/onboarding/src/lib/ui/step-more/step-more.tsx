import { CardCVV, CardComponent, CardExpiry, CardNumber, Provider } from '@chargebee/chargebee-js-react-wrapper'
import type FieldContainer from '@chargebee/chargebee-js-react-wrapper/dist/components/FieldContainer'
import type CbInstance from '@chargebee/chargebee-js-types/cb-types/models/cb-instance'
import { type FormEvent, type MutableRefObject, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ENVIRONMENTS_URL, ONBOARDING_PERSONALIZE_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { Button, Icon } from '@qovery/shared/ui'

export interface SelectedPlanSummary {
  title: string
  price: number | 'custom'
  list?: string[]
}

export interface StepMoreProps {
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

export function StepMore(props: StepMoreProps) {
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

  const getSelectedPlanPrice = () => {
    if (selectedPlan.price === 'custom') return 'Custom pricing'
    if (selectedPlan.price === 0) return 'Free'
    return `$${selectedPlan.price} / month`
  }

  const getCSSVariable = (variableName: string): string => {
    if (typeof window === 'undefined') return ''
    const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()
    return value || ''
  }

  const fieldStyles = useMemo(() => {
    const neutral400 = getCSSVariable('--color-neutral-400')
    const neutral350 = getCSSVariable('--color-neutral-350')
    const red500 = getCSSVariable('--color-red-500')

    return {
      base: {
        color: neutral400,
        fontWeight: '400',
        fontFamily: 'Roboto, Helvetica, sans-serif',
        fontSize: '14px',
        lineHeight: '1.25rem',
        letterSpacing: '0.0025em',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: neutral350,
        },
        ':focus': {
          color: neutral400,
        },
      },
      invalid: {
        color: red500,
        ':focus': {
          color: red500,
        },
      },
    }
  }, [])

  const showCardFields = cbInstance !== null
  const isSubmitDisabled = !isCardReady || !showCardFields || isSubmitting

  return (
    <div className="mx-auto flex max-w-[1024px] gap-16">
      <div className="flex flex-1 flex-col py-8">
        <h1 className="h3 mb-3 text-neutral-400">Start with a 14-days free trial</h1>
        <p className="mb-10 text-sm text-neutral-400">
          Try Qovery with a 14-days trial, without payment.{' '}
          <span className="font-medium">You’ll not be charged today.</span>
        </p>
        <form onSubmit={onSubmit} className="flex flex-1 flex-col">
          <style>
            {`
              /* Individual field wrappers matching InputText design */
              .chargebee-field-wrapper {
                position: relative;
                min-height: 52px;
                cursor: pointer;
                border-radius: 0.25rem;
                border: 1px solid var(--color-neutral-250);
                background-color: white;
                padding: 0.5rem 0.75rem;
                transition: all 120ms cubic-bezier(0.4, 0, 0.2, 1), 0s outline;
                margin-bottom: 1rem;
              }

              /* Hover state */
              .chargebee-field-wrapper:hover {
                border-color: var(--color-brand-500);
                box-shadow: 0 2px 2px rgba(0, 0, 0, 0.05);
              }

              /* Focus state */
              .chargebee-field-wrapper.chargebee-field-focus {
                border-color: var(--color-brand-500);
                outline: 3px solid var(--color-brand-100);
                box-shadow: 0 2px 2px rgba(0, 0, 0, 0.05);
              }

              /* Label styling */
              .chargebee-field-label {
                display: block;
                font-size: 0.75rem;
                line-height: 1rem;
                letter-spacing: 0.002em;
                color: var(--color-neutral-350);
                font-family: Roboto, Helvetica, sans-serif;
                font-weight: 400;
                margin-bottom: 0.25rem;
              }

              /* Expiry and CVV row */
              .chargebee-fields-row {
                display: flex;
                gap: 1rem;
              }

              .chargebee-fields-row > div {
                flex: 1;
              }

              /* Hide Chargebee default container styles */
              .chargebee-field-wrapper > div {
                border: none !important;
                padding: 0 !important;
                margin: 0 !important;
                background: transparent !important;
                box-shadow: none !important;
              }

              /* Iframe styling */
              .chargebee-field-wrapper iframe {
                border: none !important;
                margin: 0 !important;
                padding: 0 !important;
                display: block !important;
                width: 100% !important;
                min-height: 20px !important;
              }
            `}
          </style>
          <div className="z-0 mb-8">
            {!showCardFields && (
              <div className="rounded-md border border-neutral-200 bg-white p-4 text-sm text-neutral-350">
                Preparing secure card fields...
              </div>
            )}
            {showCardFields && (
              <Provider cbInstance={cbInstance}>
                <CardComponent ref={cardRef} styles={fieldStyles} locale="en" currency="USD" onReady={onCardReady}>
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
          <div className="mb-4 rounded-lg border border-brand-200 bg-brand-50 p-4 text-neutral-400 lg:hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-400">{selectedPlan.title}</p>
                <p className="text-sm text-brand-500">{getSelectedPlanPrice()}</p>
              </div>
              <button type="button" className="text-sm text-neutral-350 underline" onClick={onChangePlan}>
                Change plan
              </button>
            </div>
          </div>
          <div className="mt-auto">
            <p>
              You have specific needs?{' '}
              <a href="https://qovery.com/demo" target="_blank" rel="noreferrer" className="text-sky-500">
                Book a demo
              </a>{' '}
              with us and unlock a trial that truly suits you.
            </p>
            <div className="mt-4 flex justify-between border-t border-neutral-200 pt-5">
              {!backButton ? (
                <Button
                  type="button"
                  size="lg"
                  color="neutral"
                  variant="surface"
                  className="gap-2"
                  onClick={() => navigate(`${ONBOARDING_URL}${ONBOARDING_PERSONALIZE_URL}`)}
                >
                  <Icon name="icon-solid-arrow-left" />
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
                    if (localStorage['currentOrganizationId']) {
                      navigate(
                        ENVIRONMENTS_URL(
                          localStorage['currentOrganizationId'] || '',
                          localStorage['currentProjectId'] || ''
                        )
                      )
                    } else {
                      navigate(-1)
                    }
                  }}
                >
                  <Icon name="icon-solid-arrow-left" />
                  Back
                </Button>
              )}
              <Button type="submit" size="lg" loading={isSubmitting} disabled={isSubmitDisabled}>
                Start my 14-days free trial
              </Button>
            </div>
          </div>
        </form>
      </div>
      <div className="hidden flex-1 rounded-lg border border-brand-200 bg-mesh-gradient bg-cover lg:block">
        <div className="p-8">
          <h2 className="h4 mb-6 text-center text-neutral-400">
            Make the most out of Qovery with our <span className="text-brand-500">14-days free trial</span>
          </h2>
          <div className="rounded-md border border-brand-200 bg-white">
            <div className="flex border-b p-6">
              <div className="mr-4 flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-500 text-white">
                  <Icon name="fa-rocket fa-regular" className="text-sm" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="w-2 flex-1 rounded-b-full bg-brand-500"></div>
                  <div className="w-2 flex-1 bg-brand-50"></div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 text-brand-500">
                  <Icon name="fa-calendar fa-regular" className="text-sm" />
                </div>
                <div className="w-2 flex-1 bg-brand-50"></div>
                <div className="mb-7 flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 text-brand-500">
                  <Icon name="fa-crown fa-regular" className="text-sm" />
                </div>
              </div>
              <div>
                <div className="mb-8">
                  <h3 className="mb-1 text-sm font-medium text-neutral-400">
                    Today: Start you trial and deploy your first app
                  </h3>
                  <p className="text-ssm font-normal text-neutral-350">
                    Access to the full extend of our features with your dedicated Qovery plan.
                  </p>
                </div>
                <div className="mb-8">
                  <h3 className="mb-1 text-sm font-medium text-neutral-400">November 22: Trial reminder </h3>
                  <p className="text-ssm font-normal text-neutral-350">
                    We’ll remind you via an email and on the product two days before the end.
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-medium text-neutral-400">November 24: Welcome onboard! </h3>
                  <p className="text-ssm font-normal text-neutral-350">
                    Your subscription will start automatically. You can cancel at anytime.{' '}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-neutral-400">{selectedPlan.title}</p>
                  <p className="mb-2 text-sm text-brand-500">{getSelectedPlanPrice()}</p>
                  <button type="button" className="text-sm text-neutral-350 underline" onClick={onChangePlan}>
                    Change plan
                  </button>
                </div>
                <div>
                  {selectedPlan.list &&
                    selectedPlan.list.slice(0, 4).map((item) => (
                      <div key={item} className="mb-1 flex items-center text-sm text-neutral-400">
                        <Icon name="fa-circle-check fa-regular" className="mr-2 text-green-500" />
                        {item}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepMore
