import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchCustomRoles, selectCustomRoles, selectCustomRolesLoadingStatus } from '@qovery/domains/organization'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store/data'
import PageOrganizationRoles from '../../ui/page-organization-roles/page-organization-roles'

export function PageOrganizationRolesFeature() {
  const { organizationId = '' } = useParams()

  useDocumentTitle('Roles & permissions - Organization settings')

  const [loading, setLoading] = useState(false)
  const customRoles = useSelector((state: RootState) => selectCustomRoles(state))
  const customRolesLoadingStatus = useSelector((state: RootState) => selectCustomRolesLoadingStatus(state))

  const dispatch = useDispatch<AppDispatch>()

  const methods = useForm({
    mode: 'onChange',
  })

  useEffect(() => {
    if (customRolesLoadingStatus !== 'loaded') dispatch(fetchCustomRoles({ organizationId }))
  }, [dispatch, customRolesLoadingStatus, organizationId])

  const onSubmit = methods.handleSubmit((data) => {
    console.log(data)

    setLoading(false)
  })

  return (
    <FormProvider {...methods}>
      <PageOrganizationRoles
        customRoles={customRoles}
        onSubmit={onSubmit}
        loading={customRolesLoadingStatus}
        loadingForm={loading}
      />
    </FormProvider>
  )
}

export default PageOrganizationRolesFeature
