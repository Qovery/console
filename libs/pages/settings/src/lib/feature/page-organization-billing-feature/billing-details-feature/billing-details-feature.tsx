import { type BillingInfoRequest } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editBillingInfo } from '@qovery/domains/organization'
import { useBillingInfo } from '@qovery/domains/organizations/feature'
import { countries } from '@qovery/shared/enums'
import { type Value } from '@qovery/shared/interfaces'
import { IconFlag } from '@qovery/shared/ui'
import { type AppDispatch } from '@qovery/state/store'
import BillingDetails from '../../../ui/page-organization-billing/billing-details/billing-details'

export function BillingDetailsFeature() {
  const { organizationId = '' } = useParams()
  const [editInProcess, setEditInProcess] = useState(false)
  const [countryValues, setCountryValues] = useState<Value[]>([])
  const { data: billingInfo, isLoading: isLoadingBillingInfo } = useBillingInfo({ organizationId })
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
    methods.reset(billingInfo as BillingInfoRequest)
  }, [billingInfo, methods])

  return (
    <FormProvider {...methods}>
      <BillingDetails
        onSubmit={onSubmit}
        countryValues={countryValues}
        loadingBillingInfos={isLoadingBillingInfo}
        editInProcess={editInProcess}
      />
    </FormProvider>
  )
}

export default BillingDetailsFeature
