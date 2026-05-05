import { useNavigate } from '@tanstack/react-router'
import { type OrganizationCustomRoleCreateRequest } from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { InputText, InputTextArea, ModalCrud } from '@qovery/shared/ui'
import { useCreateCustomRole } from '../../hooks/use-create-custom-role/use-create-custom-role'

export interface CreateModalProps {
  onClose: () => void
  organizationId?: string
}

export function CreateModal(props: CreateModalProps) {
  const { organizationId = '', onClose } = props

  const { mutateAsync: createCustomRole, isLoading: isLoadingCustomRole } = useCreateCustomRole()
  const navigate = useNavigate()

  const methods = useForm({
    mode: 'onChange',
  })

  const { control } = methods

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      const response = await createCustomRole({
        organizationId: organizationId,
        customRoleUpdateRequest: data as OrganizationCustomRoleCreateRequest,
      })

      onClose()
      // redirect to edit page
      if (response?.id) {
        navigate({
          to: '/organization/$organizationId/settings/roles/edit/$roleId',
          params: {
            organizationId,
            roleId: response.id,
          },
        })
      }
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Add new role"
        description="Give a name and a description to your new role."
        onSubmit={onSubmit}
        onClose={onClose}
        loading={isLoadingCustomRole}
      >
        <Controller
          name="name"
          control={control}
          rules={{
            required: 'Please enter a name.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              dataTestId="input-name"
              className="mb-5"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Name"
              error={error?.message}
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <InputTextArea
              dataTestId="input-description"
              className="mb-5"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Description"
              error={error?.message}
            />
          )}
        />
      </ModalCrud>
    </FormProvider>
  )
}

export default CreateModal
