import { Organization } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editOrganization, selectOrganizationById } from '@qovery/domains/organization'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import PageOrganizationGeneral from '../../ui/page-organization-general/page-organization-general'

export const handleSubmit = (data: FieldValues, organization: Organization) => {
  return {
    ...organization,
    logo_url: data['logo_url'],
    name: data['name'],
    description: data['description'],
    website_url: data['website_url'],
    admin_emails: data['admin_emails'],
  }
}

export function PageOrganizationGeneralFeature() {
  const { organizationId = '' } = useParams()
  useDocumentTitle('General - Organization settings')

  const organization = useSelector((state: RootState) => selectOrganizationById(state, organizationId))

  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch<AppDispatch>()

  const methods = useForm({
    mode: 'onChange',
  })

  useEffect(() => {
    methods.reset({
      name: organization?.name || '',
      logo_url: organization?.logo_url || '',
      description: organization?.description || '',
      website_url: organization?.website_url || '',
      admin_emails: organization?.admin_emails || '',
    })
  }, [
    methods,
    organization?.logo_url,
    organization?.name,
    organization?.description,
    organization?.website_url,
    organization?.admin_emails,
  ])

  const onSubmit = methods.handleSubmit((data) => {
    if (data && organization) {
      setLoading(true)
      const cloneOrganization = handleSubmit(data, organization)

      dispatch(
        editOrganization({
          organizationId,
          data: cloneOrganization,
        })
      )
        .unwrap()
        .then(() => setLoading(false))
        .catch(() => setLoading(false))
    }
  })

  return (
    <FormProvider {...methods}>
      <PageOrganizationGeneral onSubmit={onSubmit} loading={loading} created_at={organization?.created_at || ''} />
    </FormProvider>
  )
}

export default PageOrganizationGeneralFeature
