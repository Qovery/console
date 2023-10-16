import { type OrganizationAvailableRole } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { InputSelect, InputText, InputTextArea, LoaderSpinner, ModalCrud } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface CrudModalProps {
  onSubmit: () => void
  onClose: () => void
  availableRoles: OrganizationAvailableRole[]
  loading?: boolean
}

export function CrudModal({ onClose, onSubmit, availableRoles, loading }: CrudModalProps) {
  const { control } = useFormContext()

  return (
    <ModalCrud
      title="Create new API token"
      description="Use API Token to programmatically manage your organization."
      howItWorks={
        <p>
          API Tokens can be used to programmatically access the Qovery API. Provide a name, description and a role to
          limit the Token permission. Once created, securely store the token value since it cannot be retrieved
          afterwards.
        </p>
      }
      onSubmit={onSubmit}
      onClose={onClose}
      loading={loading}
    >
      <Controller
        name="name"
        control={control}
        rules={{
          required: 'Please enter a token name.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            dataTestId="input-name"
            className="mb-5"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Token name"
            error={error?.message}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputTextArea
            className="mb-5"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Description"
            error={error?.message}
          />
        )}
      />
      {availableRoles.length > 0 ? (
        <Controller
          name="role_id"
          control={control}
          defaultValue={availableRoles[0]?.id} // ADMIN default role
          rules={{
            required: 'Please enter a role.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              dataTestId="input-role"
              className="w-full"
              label="Role"
              options={availableRoles.map((availableRole: OrganizationAvailableRole) => ({
                label: upperCaseFirstLetter(availableRole.name),
                value: availableRole.id ?? '',
              }))}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
              isSearchable
              menuPlacement={availableRoles.length > 7 ? 'top' : 'bottom'}
              portal={availableRoles.length > 7 ? false : true}
            />
          )}
        />
      ) : (
        <div className="flex justify-center">
          <LoaderSpinner className="w-4" />
        </div>
      )}
    </ModalCrud>
  )
}

export default CrudModal
