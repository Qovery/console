import { type OrganizationCustomRoleCreateRequest } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useCreateCustomRole } from '@qovery/domains/organizations/feature'
import { SETTINGS_ROLES_EDIT_URL, SETTINGS_URL } from '@qovery/shared/routes'
import CreateModal from '../../../ui/page-organization-roles/create-modal/create-modal'

export interface CreateModalFeatureProps {
  onClose: () => void
  organizationId?: string
}

export function CreateModalFeature(props: CreateModalFeatureProps) {
  const { organizationId = '', onClose } = props

  const { mutateAsync: createCustomRole, isLoading: isLoadingCustomRole } = useCreateCustomRole()
  const navigate = useNavigate()

  const methods = useForm({
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      const response = await createCustomRole({
        organizationId: organizationId,
        customRoleUpdateRequest: data as OrganizationCustomRoleCreateRequest,
      })

      onClose()
      // redirect to edit page
      navigate(`${SETTINGS_URL(organizationId)}${SETTINGS_ROLES_EDIT_URL(response.id)}`)
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <FormProvider {...methods}>
      <CreateModal onSubmit={onSubmit} onClose={onClose} loading={isLoadingCustomRole} />
    </FormProvider>
  )
}

export default CreateModalFeature
