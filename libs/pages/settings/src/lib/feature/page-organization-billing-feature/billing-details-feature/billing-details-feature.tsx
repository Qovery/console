import { BillingInfoRequest } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editBillingInfo, fetchBillingInfo, selectOrganizationById } from '@qovery/domains/organization'
import { LoadingStatus } from '@qovery/shared/interfaces'
import { AppDispatch, RootState } from '@qovery/store'
import BillingDetails from '../../../ui/page-organization-billing/billing-details/billing-details'

export function BillingDetailsFeature() {
  const { organizationId } = useParams()
  const [editInProcess, setEditInProcess] = useState(false)
  const methods = useForm<BillingInfoRequest>({
    mode: 'onChange',
    defaultValues: {
      city: '',
      address: '',
      state: '',
      company: '',
      zip: '',
      email: '',
      first_name: '',
      last_name: '',
      vat_number: '',
      country_code: '',
    },
  })

  const loadingBillingInfoStatus = useSelector<RootState, LoadingStatus | undefined>(
    (state) => selectOrganizationById(state, organizationId ?? '')?.billingInfos?.loadingStatus
  )

  const dispatch = useDispatch<AppDispatch>()

  const onSubmit = methods.handleSubmit((data) => {
    if (organizationId) {
      setEditInProcess(true)
      dispatch(editBillingInfo({ organizationId, billingInfoRequest: data }))
        .unwrap()
        .then((data) => {
          methods.reset(data)
        })
        .catch(console.error)
        .then(() => setEditInProcess(false))
    }
  })

  useEffect(() => {
    if (organizationId) {
      dispatch(fetchBillingInfo({ organizationId }))
        .unwrap()
        .then((data) => {
          methods.reset(data)
        })
    }
  }, [organizationId, dispatch, methods])

  return (
    <FormProvider {...methods}>
      <BillingDetails
        onSubmit={onSubmit}
        loadingBillingInfos={!loadingBillingInfoStatus || loadingBillingInfoStatus !== 'loaded'}
        editInProcess={editInProcess}
      />
    </FormProvider>
  )
}

export default BillingDetailsFeature
