import { OrganizationCustomRole } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchCustomRoles, selectOrganizationById } from '@qovery/domains/organization'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store/data'
import PageOrganizationRoles from '../../ui/page-organization-roles/page-organization-roles'

export const handleSubmit = (data: any, organization: OrganizationEntity) => {
  return organization
}

export function PageOrganizationRolesFeature() {
  const { organizationId = '' } = useParams()

  useDocumentTitle('Roles & permissions - Organization settings')

  const [loading, setLoading] = useState(false)
  const [currentRole, setCurrentRole] = useState<OrganizationCustomRole | undefined>()

  const organization = useSelector((state: RootState) => selectOrganizationById(state, organizationId))
  const customRolesLoadingStatus = useSelector(
    (state: RootState) => selectOrganizationById(state, organizationId)?.customRoles?.loadingStatus
  )
  const customRoles = organization?.customRoles?.items
  const dispatch = useDispatch<AppDispatch>()

  const methods = useForm({
    mode: 'onChange',
  })

  useEffect(() => {
    if (organization && customRolesLoadingStatus !== 'loaded') dispatch(fetchCustomRoles({ organizationId }))
  }, [organization, customRolesLoadingStatus, dispatch, organizationId])

  useEffect(() => {
    if (customRoles) setCurrentRole(customRoles[0])
  }, [customRoles])

  const onSubmit = methods.handleSubmit((data) => {
    if (data && organization) {
      setLoading(false)

      console.log(organization?.customRoles?.items)
      console.log(data)
      // const cloneOrganization = handleSubmit(data, organization)

      // dispatch(
      //   editCustomRoles({
      //     organizationId,
      //     data: {} as any,
      //   })
      // )
      //   .unwrap()
      //   .then(() => setLoading(false))
      //   .catch(() => setLoading(false))
    }
  })

  return (
    <FormProvider {...methods}>
      <PageOrganizationRoles
        customRoles={customRoles}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        onSubmit={onSubmit}
        loading={customRolesLoadingStatus || 'not loaded'}
        loadingForm={loading}
      />
    </FormProvider>
  )
}

export default PageOrganizationRolesFeature
