import { type Organization } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useEditOrganization, useOrganization } from '@qovery/domains/organizations/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageOrganizationGeneral from '../../ui/page-organization-general/page-organization-general'

export const handleSubmit = (data: FieldValues, organization: Organization) => {
  return {
    ...organization,
    logo_url: data['logo_url'],
    name: data['name'],
    description: data['description'],
    website_url: data['website_url'] === '' ? undefined : data['website_url'],
    admin_emails: data['admin_emails'],
  }
}

export function PageOrganizationGeneralFeature() {
  const { organizationId = '' } = useParams()
  useDocumentTitle('General - Organization settings')

  const { data: organization } = useOrganization({ organizationId })
  const { mutateAsync: editOrganization, isLoading: isLoadingEditOrganization } = useEditOrganization()

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

  const onSubmit = methods.handleSubmit(async (data) => {
    if (data && organization) {
      const cloneOrganization = handleSubmit(data, organization)

      try {
        await editOrganization({
          organizationId,
          organizationRequest: cloneOrganization,
        })
      } catch (error) {
        console.error(error)
      }
    }
  })

  if (!organization) return null

  return (
    <FormProvider {...methods}>
      <PageOrganizationGeneral
        onSubmit={onSubmit}
        loading={isLoadingEditOrganization}
        created_at={organization?.created_at || ''}
      />
    </FormProvider>
  )
}

export default PageOrganizationGeneralFeature
