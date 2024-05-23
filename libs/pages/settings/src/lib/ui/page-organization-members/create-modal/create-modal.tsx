import { type OrganizationAvailableRole } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { InputSelect, InputText, ModalCrud } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface CreateModalProps {
  availableRoles: OrganizationAvailableRole[]
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
}

export function CreateModal(props: CreateModalProps) {
  const { availableRoles } = props
  const { control } = useFormContext()

  return (
    <ModalCrud
      title="Invite team member"
      submitLabel="Send invitation"
      onSubmit={props.onSubmit}
      onClose={props.onClose}
      loading={props.loading}
    >
      <div className="flex w-full">
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
              className="ml-3 w-full"
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
      </div>
    </ModalCrud>
  )
}

export default CreateModal
