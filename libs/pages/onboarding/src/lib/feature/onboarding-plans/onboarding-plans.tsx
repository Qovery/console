import type FieldContainer from '@chargebee/chargebee-js-react-wrapper/dist/components/FieldContainer'
import type CbInstance from '@chargebee/chargebee-js-types/cb-types/models/cb-instance'
import { PlanEnum, type SignUpRequest } from 'qovery-typescript-axios'
import { type FormEvent, useContext, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useOrganizations } from '@qovery/domains/organizations/feature'
import { useCreateUserSignUp, useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { useAuth } from '@qovery/shared/auth'
import { ONBOARDING_PROJECT_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { ExternalLink, Heading, Section, toastError, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { loadChargebee } from '@qovery/shared/util-payment'
import { type SerializedError } from '@qovery/shared/utils'
import PlanCard from '../../ui/plan-card/plan-card'
import StepPlans from '../../ui/step-plans/step-plans'
import { ContextOnboarding } from '../container/container'

const PLANS = [
  {
    name: PlanEnum.USER_2025,
    title: 'User plan',
    text: 'Perfect for small team',
    price: 299,
    list: [
      'Deploy on your own cloud',
      'Include 2 users',
      'Include 1 managed cluster',
      'Include 1,000 deployment minutes',
      'Standard support',
    ],
  },
  {
    name: PlanEnum.TEAM_2025,
    title: 'Team plan',
    text: 'Ideal for teams',
    price: 899,
    list: [
      'Deploy on your own cloud',
      'Include 10 users',
      'Include 2 managed cluster',
      'Include 5,000 deployment minutes',
      'Standard support',
    ],
  },
  {
    name: PlanEnum.BUSINESS_2025,
    title: 'Business plan',
    text: 'For growing businesses',
    price: 2099,
    list: [
      'Deploy on your own cloud',
      'Include 30 users',
      'Include 3 managed cluster',
      'Include 10,000 deployment minutes',
      'Business support with SLAs',
    ],
  },
  {
    name: PlanEnum.ENTERPRISE_2025,
    title: 'Enterprise plan',
    text: 'Tailored for your organization',
    price: 'custom' as const,
    list: ['All BUSINESS features', 'Deploy on-premise or private cloud', 'Custom limits', 'Custom support'],
  },
]

export function OnboardingPlans() {
  useDocumentTitle('Onboarding Free trial activation - Qovery')

  const { data: userSignUp, refetch: refetchUserSignUp } = useUserSignUp()
  const { mutateAsync: createUserSignUp } = useCreateUserSignUp()
  const { openModal, closeModal } = useModal()
  const cardRef = useRef<FieldContainer>(null)
  const [cbInstance, setCbInstance] = useState<CbInstance | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCardReady, setIsCardReady] = useState(false)
  const { selectedPlan, setContextValue } = useContext(ContextOnboarding)
  const { authLogout } = useAuth()
  const { data: organizations = [] } = useOrganizations()

  const navigate = useNavigate()
  const shouldSkipBilling = userSignUp?.dx_auth === true
  const plan = PLANS.find((plan) => plan.name === selectedPlan) ?? PLANS[0]
  const selectablePlans = PLANS.filter((planOption) => planOption.name !== PlanEnum.ENTERPRISE_2025)
  const backButton = organizations.length > 0

  useEffect(() => {
    let mounted = true

    if (shouldSkipBilling) {
      return () => {
        mounted = false
      }
    }

    const initializeChargebee = async () => {
      try {
        const instance = await loadChargebee()

        if (!mounted) {
          return
        }

        setCbInstance(instance)
      } catch (error) {
        console.error('Failed to initialize Chargebee:', error)
      }
    }

    initializeChargebee()

    return () => {
      mounted = false
    }
  }, [shouldSkipBilling])

  if (shouldSkipBilling) {
    return <Navigate to={`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`} replace />
  }

  const handlePlanSelect = (planName: PlanEnum) => {
    setContextValue?.({ selectedPlan: planName })
    setTimeout(() => closeModal(), 200)
  }

  const openPlanSelectionModal = () => {
    openModal({
      content: (
        <Section className="h-full p-8">
          <div>
            <Heading level={1} className="mb-1 text-neutral-400">
              Change your plan
            </Heading>
            <p className="mb-6 text-sm text-neutral-350">Choose the plan that suits you the best.</p>
          </div>
          <div className="mb-8 flex flex-col gap-5 md:flex-row">
            {selectablePlans.map((planOption) => (
              <div key={planOption.name} className="flex-1">
                <PlanCard {...planOption} loading="" onClick={() => handlePlanSelect(planOption.name)} />
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between">
            <p className="text-sm text-neutral-400">
              You have specific needs? Book a demo with us and unlock a trial that truly suits you.
            </p>
            <ExternalLink
              href="https://meetings-eu1.hubspot.com/hakob-hakobian/free-trial-contact-sales"
              color="brand"
              withIcon
              className="gap-1 text-sm font-semibold"
            >
              Book a demo
            </ExternalLink>
          </div>
        </Section>
      ),
      options: { fullScreen: true },
    })
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (shouldSkipBilling) {
      navigate(`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`)
      return
    }

    if (!userSignUp) return
    if (!cardRef.current || !isCardReady || !cbInstance) return

    setIsSubmitting(true)

    try {
      const tokenizedCard = await cardRef.current.tokenize({})

      if (!tokenizedCard.token) {
        throw new Error('No token returned from Chargebee')
      }

      setContextValue?.({
        cardToken: tokenizedCard.token,
        cardLast4: tokenizedCard.card?.last4 ?? null,
        cardExpiryMonth: tokenizedCard.card?.expiry_month ?? null,
        cardExpiryYear: tokenizedCard.card?.expiry_year ?? null,
      })

      const hasRequiredSignUpFields =
        !!userSignUp?.first_name && !!userSignUp?.last_name && !!userSignUp?.user_email && !!userSignUp?.qovery_usage

      if (hasRequiredSignUpFields) {
        const signUpPayload: SignUpRequest = {
          first_name: userSignUp.first_name,
          last_name: userSignUp.last_name,
          user_email: userSignUp.user_email,
          type_of_use: userSignUp.type_of_use,
          qovery_usage: userSignUp.qovery_usage,
          company_name: userSignUp.company_name ?? undefined,
          company_size: userSignUp.company_size ?? undefined,
          user_role: userSignUp.user_role ?? undefined,
          qovery_usage_other: userSignUp.qovery_usage_other ?? undefined,
          user_questions: userSignUp.user_questions ?? undefined,
          current_step: 'billing',
          dx_auth: userSignUp.dx_auth ?? undefined,
          infrastructure_hosting: userSignUp.infrastructure_hosting ?? undefined,
        }

        await createUserSignUp(signUpPayload)
      }

      await refetchUserSignUp()
      navigate(`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`)
    } catch (error) {
      console.error(error)
      toastError(error as unknown as SerializedError)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!cbInstance) return null

  return (
    <StepPlans
      onSubmit={onSubmit}
      selectedPlan={plan}
      onChangePlan={openPlanSelectionModal}
      authLogout={authLogout}
      backButton={backButton}
      cbInstance={cbInstance}
      cardRef={cardRef}
      onCardReady={() => setIsCardReady(true)}
      isCardReady={isCardReady}
      isSubmitting={isSubmitting}
    />
  )
}

export default OnboardingPlans
