import { type OrganizationPolicyApiToken } from 'qovery-typescript-axios'
import { Button, CodeEditor, InputText } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface PolicyApiTokenPolicyModalProps {
  token: OrganizationPolicyApiToken
  onClose: () => void
}

export function PolicyApiTokenPolicyModal({ token, onClose }: PolicyApiTokenPolicyModalProps) {
  return (
    <div className="p-6">
      <h2 className="h4 mb-1 max-w-full truncate text-neutral">Policy of {token.name}</h2>
      <p className="mb-6 text-xs text-neutral-subtle">
        Authorization is two gates, and both must open: this policy is asked first, on every request, and decides
        whether the request proceeds at all; the role below bounds what it can do once it has.
      </p>

      {/* Read-only: a token's role is fixed at creation, like its policy. */}
      <InputText
        name="role"
        label="Role"
        value={token.role_name ? upperCaseFirstLetter(token.role_name) : ''}
        disabled
        className="mb-5"
      />

      <div className="overflow-hidden rounded border border-neutral retina:border-[0.5px]">
        {/* Monaco has no rego language, so plaintext is the closest honest highlighting. */}
        <CodeEditor language="plaintext" height="360px" value={token.opa_policy ?? ''} readOnly />
      </div>

      <div className="mt-6 flex justify-end">
        <Button data-testid="close-policy-modal" onClick={onClose} size="lg">
          Close
        </Button>
      </div>
    </div>
  )
}

export default PolicyApiTokenPolicyModal
