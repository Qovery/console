import { type FormEventHandler } from 'react'
import { type Value } from '@qovery/shared/interfaces'
import BillingDetails from '../../../ui/page-organization-billing/billing-details/billing-details'

export interface BillingDetailsFeatureProps {
  countryValues?: Value[]
  loadingBillingInfos?: boolean
  editInProcess?: boolean
  onSubmit?: FormEventHandler<HTMLFormElement>
}

export function BillingDetailsFeature(props: BillingDetailsFeatureProps) {
  return (
    <BillingDetails
      onSubmit={props.onSubmit}
      countryValues={props.countryValues}
      loadingBillingInfos={props.loadingBillingInfos}
      editInProcess={props.editInProcess}
    />
  )
}

export default BillingDetailsFeature
