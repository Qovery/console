import { PlanEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import { useModal } from '@qovery/shared/ui'
import UpgradePlanModal from '../../../ui/page-organization-billing-summary/upgrade-plan-modal/upgrade-plan-modal'
import CheckoutUpgradeModalFeature from '../checkout-upgrade-modal-feature/checkout-upgrade-modal-feature'

export interface UpgradePlanModalFeatureProps {
  organization?: OrganizationEntity
  closeModal: () => void
}

export function UpgradePlanModalFeature(props: UpgradePlanModalFeatureProps) {
  const methods = useForm<{ plan: PlanEnum }>({ defaultValues: { plan: props.organization?.plan } })
  const { openModal } = useModal()

  const onSubmit = methods.handleSubmit((data) => {
    console.log(data)
  })

  useEffect(() => {
    console.log(props.organization?.plan)
    if (props.organization?.plan) methods.setValue('plan', props.organization.plan)
  }, [props.organization, methods])

  const openCheckout = (plan: PlanEnum) => {
    if (props.organization) {
      openModal({
        content: <CheckoutUpgradeModalFeature organization={props.organization} plan={plan} />,
      })
    }
  }

  return (
    <FormProvider {...methods}>
      <UpgradePlanModal
        currentPlan={props.organization?.plan}
        onClose={props.closeModal}
        onSubmit={onSubmit}
        openCheckout={openCheckout}
      />
    </FormProvider>
  )
}

export default UpgradePlanModalFeature
