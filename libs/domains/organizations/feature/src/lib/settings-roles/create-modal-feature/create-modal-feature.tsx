import { useNavigate } from '@tanstack/react-router'
import { type OrganizationCustomRoleCreateRequest } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { Controller, useFormContext } from 'react-hook-form'
import { SETTINGS_ROLES_EDIT_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { InputText, InputTextArea, ModalCrud } from '@qovery/shared/ui'
import { useCreateCustomRole } from '../../hooks/use-create-custom-role/use-create-custom-role'

interface CreateModalProps {
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
}

function CreateModal(props: CreateModalProps) {
  const { control } = useFormContext()

  return (
    <ModalCrud
      title="Add new role"
      description="Give a name and a description to your new role."
      onSubmit={props.onSubmit}
      onClose={props.onClose}
      loading={props.loading}
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
  )
}

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
