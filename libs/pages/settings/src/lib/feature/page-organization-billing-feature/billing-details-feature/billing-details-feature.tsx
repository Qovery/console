import { BillingInfoRequest } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editBillingInfo, fetchBillingInfo, selectOrganizationById } from '@qovery/domains/organization'
import { LoadingStatus, OrganizationEntity, Value } from '@qovery/shared/interfaces'
import { IconFlag } from '@qovery/shared/ui'
import { countries } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import BillingDetails from '../../../ui/page-organization-billing/billing-details/billing-details'

export function BillingDetailsFeature() {
  const { organizationId } = useParams()
  const [editInProcess, setEditInProcess] = useState(false)
  const [countryValues, setCountryValues] = useState<Value[]>([])
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

  const organization = useSelector<RootState, OrganizationEntity | undefined>((state) =>
    selectOrganizationById(state, organizationId ?? '')
  )

  const dispatch = useDispatch<AppDispatch>()

  const onSubmit = methods.handleSubmit((data) => {
    if (organizationId) {
      setEditInProcess(true)
      dispatch(editBillingInfo({ organizationId, billingInfoRequest: data }))
        .unwrap()
        .then((data) => {
          methods.reset(data as BillingInfoRequest)
        })
        .catch(console.error)
        .then(() => setEditInProcess(false))
    }
  })

  useEffect(() => {
    setCountryValues(
      countries.map((country) => ({ label: country.name, value: country.code, icon: <IconFlag code={country.code} /> }))
    )
  }, [setCountryValues])

  useEffect(() => {
    if (organizationId && !organization?.billingInfos?.loadingStatus) {
      dispatch(fetchBillingInfo({ organizationId }))
    }
  }, [organizationId, dispatch, methods, organization?.billingInfos?.loadingStatus])

  useEffect(() => {
    if (organization?.billingInfos?.value) {
      methods.reset(organization.billingInfos.value as BillingInfoRequest)
    }
  }, [organization, methods])

  return (
    <FormProvider {...methods}>
      <BillingDetails
        onSubmit={onSubmit}
        countryValues={countryValues}
        loadingBillingInfos={!loadingBillingInfoStatus || loadingBillingInfoStatus !== 'loaded'}
        editInProcess={editInProcess}
      />
    </FormProvider>
  )
}

export default BillingDetailsFeature
