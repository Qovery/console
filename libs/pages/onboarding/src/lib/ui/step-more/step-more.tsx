import { type Control } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { CreditCardForm, type CreditCardFormValues } from '@qovery/shared/console-shared'
import { ENVIRONMENTS_URL, ONBOARDING_PERSONALIZE_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { Button, Icon } from '@qovery/shared/ui'

export interface SelectedPlanSummary {
  title: string
  price: number | 'custom'
  list?: string[]
}

export interface StepMoreProps {
  onSubmit: () => void
  control: Control<CreditCardFormValues>
  selectedPlan: SelectedPlanSummary
  onChangePlan: () => void
  authLogout: () => void
  backButton?: boolean
}

export function StepMore(props: StepMoreProps) {
  const { onSubmit, control, selectedPlan, onChangePlan, authLogout, backButton } = props
  const navigate = useNavigate()

  const getSelectedPlanPrice = () => {
    if (selectedPlan.price === 'custom') return 'Custom pricing'
    if (selectedPlan.price === 0) return 'Free'
    return `$${selectedPlan.price} / month`
  }

  return (
    <div className="mx-auto flex max-w-[1024px] gap-16">
      <div className="flex flex-1 flex-col py-8">
        <h1 className="h3 mb-3 text-neutral-400">Start with a 14-days free trial</h1>
        <p className="mb-10 text-sm text-neutral-400">
          Try Qovery with a 14-days trial, without payment.{' '}
          <span className="font-medium">You’ll not be charged today.</span>
        </p>
        <form onSubmit={onSubmit} className="flex flex-1 flex-col">
          <div className="z-0 mb-8">
            <CreditCardForm />
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
              <Button type="submit" size="lg">
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
