import { type OrganizationAvailableRole, type OrganizationPolicyApiTokenCreateRequest } from 'qovery-typescript-axios'
import { useState } from 'react'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import {
  Button,
  CodeEditor,
  CopyToClipboardButtonIcon,
  InputSelect,
  InputText,
  InputTextArea,
  LoaderSpinner,
  ModalCrud,
  useModal,
} from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useAvailableRoles } from '../../hooks/use-available-roles/use-available-roles'
import { useCreatePolicyApiToken } from '../../hooks/use-create-policy-api-token/use-create-policy-api-token'

const DEFAULT_POLICY = `default allow := false

allowed_environment_id := "4a9dc488-df2b-4544-9c5f-4eb0428fda49"
allowed_application_id := "5bf547f9-b445-44bc-aab8-7f341187d362"

allow if read_only_access_on_env
allow if modify_only_allowed_service
allow if allow_deployment

# Allow read-only access to every endpoint that touch this environment.
read_only_access_on_env if {
  input.request.method in {"GET", "HEAD"}
  input.qovery_metadata.environment_id == allowed_environment_id
}

# Only allow write access only if it targets this service.
# Token is fine grained and will be able to modify only this service, *but* not delete it
modify_only_allowed_service if {
  input.request.method != "DELETE"
  input.qovery_metadata.service_id == allowed_application_id
}

# Allow deployment on this environment.
allow_deployment if {
  ["api", "environment", allowed_environment_id, "service", "deploy"] = input.request.path
}

# Input example that the policy is evaluated on.
# Body represent the json payload of the request if present.
#{
#  "request": {
#    "method": "POST",
#    "path": ["application", "7b2f9aa6-73af-4af7-9ce5-1ad9cb658842", "restart"],
#    "body": { "force": true }
#  },
#  "qovery_metadata": {
#    "organization_id": "a3c8f0d2-1b44-4e9a-9c31-6f5d2e8a7b10",
#    "service_id": "7b2f9aa6-73af-4af7-9ce5-1ad9cb658842",
#    "service_type": "APPLICATION",
#    "environment_id": "5bf547f9-b445-44bc-aab8-7f341187d362",
#    "project_id": "c47d1e83-9a06-4f52-8d7b-2e1a94c6f5b3"
#  },
#  "token": {
#    "id": "0198f2a1-6c3d-7b41-9e08-5a2d3c4b7e91",
#    "name": "deploy-agent"
#  }
#}
`

interface ValueModalProps {
  onClose: () => void
  token: string
}

function ValueModal({ onClose, token }: ValueModalProps) {
  return (
    <div className="p-6">
      <h2 className="h4 mb-6 max-w-sm truncate text-neutral">Your Policy API Token!</h2>

      <InputText
        name="token"
        label="Token"
        value={token}
        disabled
        className="mb-1"
        rightElement={<CopyToClipboardButtonIcon className="text-sm text-neutral" content={token} />}
      />
      <p className="ml-3 text-xs text-neutral-subtle">
        <strong className="text-neutral">Please keep this key safe</strong>, you will not be able to retrieve it
        after...
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <Button data-testid="submit-button" type="submit" onClick={onClose} size="lg">
          Close
        </Button>
      </div>
    </div>
  )
}

interface CrudModalProps {
  onSubmit: () => void
  onClose: () => void
  availableRoles: OrganizationAvailableRole[]
  loading?: boolean
}

function CrudModal({ onClose, onSubmit, availableRoles, loading }: CrudModalProps) {
  const { control } = useFormContext()
  // The API defaults an omitted role to organization-admin, so the select starts there too. Found by
  // name rather than by position: useAvailableRoles sorts alphabetically, so index 0 is whichever
  // role happens to sort first and may well be a custom one.
  const defaultRoleId = availableRoles.find(({ name }) => name === 'admin')?.id ?? availableRoles[0]?.id

  return (
    <ModalCrud
      title="Create new Policy API token"
      description="Give an autonomous agent programmatic access to your organization, constrained by a policy and a role."
      howItWorks={
        <p>
          Authorization is two gates, and both must open. The Open Policy Agent (rego) policy you attach is asked first,
          on every request, and decides whether the request proceeds at all; the role you pick is what the token then
          acts as, and bounds what it can do once it has. So a policy that allows everything grants no more than its
          role allows &mdash; unlike a plain API token, which has only the second gate. Write rule definitions only,
          without a <code>package</code> declaration: Qovery prepends a per-token package. The policy must define an{' '}
          <code>allow</code> rule. Once created, securely store the token value since it cannot be retrieved afterwards.
        </p>
      }
      onSubmit={onSubmit}
      onClose={onClose}
      loading={loading}
    >
      <Controller
        name="name"
        control={control}
        rules={{ required: 'Please enter a token name.' }}
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
          defaultValue={defaultRoleId}
          rules={{ required: 'Please enter a role.' }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              dataTestId="input-role"
              className="mb-5 w-full"
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
        <div className="mb-5 flex justify-center">
          <LoaderSpinner className="w-4" />
        </div>
      )}
      <Controller
        name="opa_policy"
        control={control}
        defaultValue={DEFAULT_POLICY}
        rules={{ required: 'Please enter a policy.' }}
        render={({ field, fieldState: { error } }) => (
          <div className="mb-2">
            <label className="mb-1 block text-sm text-neutral" htmlFor="opa-policy">
              Policy (rego)
            </label>
            <div
              className="overflow-hidden rounded border border-neutral retina:border-[0.5px]"
              data-testid="input-opa-policy"
            >
              {/* Monaco has no rego language, so the closest honest highlighting is plaintext. */}
              <CodeEditor language="plaintext" height="260px" value={field.value} onChange={field.onChange} />
            </div>
            {error?.message && <p className="mt-1 px-3 text-xs text-negative">{error.message}</p>}
          </div>
        )}
      />
    </ModalCrud>
  )
}

export interface PolicyApiTokenCrudModalProps {
  onClose: () => void
  organizationId: string
}

export function PolicyApiTokenCrudModal({ organizationId, onClose }: PolicyApiTokenCrudModalProps) {
  const { mutateAsync: createPolicyApiToken } = useCreatePolicyApiToken()
  const { data: availableRoles = [], isFetched: isFetchedAvailableRoles } = useAvailableRoles({ organizationId })
  const { openModal, closeModal, enableAlertClickOutside } = useModal()
  const [loading, setLoading] = useState(false)

  const methods = useForm<OrganizationPolicyApiTokenCreateRequest>({ mode: 'onChange' })

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const onSubmit = methods.handleSubmit(async (data) => {
    setLoading(true)

    try {
      const token = await createPolicyApiToken({ organizationId, policyApiTokenCreateRequest: data })
      onClose()
      if (token) {
        // The dirty-form guard lives in the modal context, not in this component, and swapping the
        // content does not reset it. Without this the token modal inherits the guard and its close
        // button offers to discard changes that have already been saved.
        enableAlertClickOutside(false)
        openModal({ content: <ValueModal token={token.token ?? ''} onClose={closeModal} /> })
      }
    } catch (error) {
      console.error(error)
    }

    setLoading(false)
  })

  // The role select needs its options to set a default value, and a Controller keeps whatever
  // defaultValue it saw on first render, so the form must not mount before the roles land.
  if (!isFetchedAvailableRoles) return null

  return (
    <FormProvider {...methods}>
      <CrudModal onSubmit={onSubmit} onClose={onClose} loading={loading} availableRoles={availableRoles} />
    </FormProvider>
  )
}
