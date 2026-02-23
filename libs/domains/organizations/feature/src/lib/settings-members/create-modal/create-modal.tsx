import { type InviteMemberRequest, type OrganizationAvailableRole } from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { InputSelect, InputText, ModalCrud } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useCreateInviteMember } from '../../hooks/use-create-invite-member/use-create-invite-member'

export interface CreateModalProps {
  onClose: () => void
  availableRoles: OrganizationAvailableRole[]
  organizationId?: string
}

export function CreateModal(props: CreateModalProps) {
  const { organizationId = '', availableRoles, onClose } = props
  const { mutateAsync: createInviteMember, isLoading: isLoadingInviteMember } = useCreateInviteMember()

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      // default value with admin id
      role_id: availableRoles[0]?.id,
    },
  })
  const { control } = methods

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
      <ModalCrud
        title="Invite team member"
        submitLabel="Send invitation"
        onSubmit={onSubmit}
        onClose={onClose}
        loading={isLoadingInviteMember}
      >
        <Controller
          name="email"
          control={control}
          rules={{
            required: 'Please enter a email.',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Please enter a valid email.',
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              dataTestId="input-email"
              className="w-full"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              type="email"
              label="Email member"
              error={error?.message}
            />
          )}
        />
        <Controller
          name="role_id"
          control={control}
          rules={{
            required: 'Please enter a role.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              dataTestId="input-role"
              className="mt-4 w-full"
              label="Role"
              options={availableRoles.map((availableRole: OrganizationAvailableRole) => ({
                label: upperCaseFirstLetter(availableRole.name),
                value: availableRole.id ?? '',
              }))}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
              isSearchable
              portal
            />
          )}
        />
      </ModalCrud>
    </FormProvider>
  )
}

export default CreateModal
