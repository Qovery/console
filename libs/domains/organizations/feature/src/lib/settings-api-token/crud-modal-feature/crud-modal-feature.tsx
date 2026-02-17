import { type OrganizationApiTokenCreateRequest } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useAvailableRoles, useCreateApiToken } from '@qovery/domains/organizations/feature'
import { useModal } from '@qovery/shared/ui'
import { type OrganizationAvailableRole } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { InputSelect, InputText, InputTextArea, LoaderSpinner, ModalCrud } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { Button, CopyToClipboardButtonIcon, InputText } from '@qovery/shared/ui'

export interface ValueModalProps {
  onClose: () => void
  token: string
}

export function ValueModal(props: ValueModalProps) {
  return (
    <div className="p-6">
      <h2 className="h4 mb-6 max-w-sm truncate text-neutral-400">Your API Token!</h2>

      <InputText
        name="token"
        label="Token"
        value={props.token}
        disabled
        className="mb-1"
        rightElement={<CopyToClipboardButtonIcon className="text-sm text-neutral-400" content={props.token} />}
      />
      <p className="ml-3 text-xs text-neutral-350">
        <strong className="text-neutral-400">Please keep this key safe</strong>, you will not be able to retrieve it
        after...
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <Button data-testid="submit-button" type="submit" onClick={props.onClose} size="lg">
          Close
        </Button>
      </div>
    </div>
  )
}

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

export interface CrudModalFeatureProps {
  onClose: () => void
  organizationId?: string
}

export function CrudModalFeature(props: CrudModalFeatureProps) {
  const { organizationId = '', onClose } = props
  const { mutateAsync: createApiToken } = useCreateApiToken()
  const { data: availableRoles = [], isFetched: isFetchedAvailableRoles } = useAvailableRoles({ organizationId })

  const { openModal, closeModal, enableAlertClickOutside } = useModal()
  const [loading, setLoading] = useState(false)

  const methods = useForm<OrganizationApiTokenCreateRequest>({
    mode: 'onChange',
  })

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const onSubmit = methods.handleSubmit(async (data) => {
    setLoading(true)

    try {
      const token = await createApiToken({ organizationId, apiTokenCreateRequest: data })
      onClose()
      if (token) {
        openModal({
          content: <ValueModal token={token.token ?? ''} onClose={closeModal} />,
        })
      }
    } catch (error) {
      console.error(error)
    }

    setLoading(false)
  })

  if (!isFetchedAvailableRoles) return null

  return (
    <FormProvider {...methods}>
      <CrudModal onSubmit={onSubmit} onClose={onClose} loading={loading} availableRoles={availableRoles} />
    </FormProvider>
  )
}

export default CrudModalFeature
