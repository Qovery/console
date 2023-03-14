import { OrganizationEntity } from '@qovery/shared/interfaces'
import UpgradePlanModal from '../../../ui/page-organization-billing-summary/upgrade-plan-modal/upgrade-plan-modal'

export interface UpgradePlanModalFeatureProps {
  organization?: OrganizationEntity
  closeModal: () => void
}

export function UpgradePlanModalFeature(props: UpgradePlanModalFeatureProps) {
  return <UpgradePlanModal currentPlan={props.organization?.currentCost?.value?.plan} onClose={props.closeModal} />
}

export default UpgradePlanModalFeature
