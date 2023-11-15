import { type InviteMemberRequest, type OrganizationAvailableRole } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useCreateInviteMember } from '@qovery/domains/organizations/feature'
import CreateModal from '../../../ui/page-organization-members/create-modal/create-modal'

export interface CreateModalFeatureProps {
  onClose: () => void
  availableRoles: OrganizationAvailableRole[]
  organizationId?: string
}

export function CreateModalFeature(props: CreateModalFeatureProps) {
  const { organizationId = '', availableRoles, onClose } = props

  const { mutateAsync: createInviteMember, isLoading: isLoadingInviteMember } = useCreateInviteMember()

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      // default value with admin id
      role_id: availableRoles[0]?.id,
    },
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      await createInviteMember({
        organizationId,
        inviteMemberRequest: data as InviteMemberRequest,
      })
      onClose()
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <FormProvider {...methods}>
      <CreateModal
        onSubmit={onSubmit}
        availableRoles={availableRoles || []}
        onClose={onClose}
        loading={isLoadingInviteMember}
      />
    </FormProvider>
  )
}

export default CreateModalFeature
