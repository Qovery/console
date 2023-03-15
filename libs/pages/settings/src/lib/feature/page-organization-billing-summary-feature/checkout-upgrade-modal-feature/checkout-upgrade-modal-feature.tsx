import { PlanEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchMembers } from '@qovery/domains/organization'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import { AppDispatch } from '@qovery/store'
import CheckoutUpgradeModal from '../../../ui/page-organization-billing-summary/checkout-upgrade-modal/checkout-upgrade-modal'

export interface CheckoutUpgradeModalFeatureProps {
  plan: PlanEnum
  organization: OrganizationEntity
}

export function CheckoutUpgradeModalFeature(props: CheckoutUpgradeModalFeatureProps) {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (!props.organization.members?.loadingStatus) {
      dispatch(fetchMembers({ organizationId: props.organization.id }))
    }
  }, [props.organization.members?.loadingStatus, dispatch, props.organization.id])

  return <CheckoutUpgradeModal plan={props.plan} memberCount={props.organization.members?.items?.length || 1} />
}

export default CheckoutUpgradeModalFeature
