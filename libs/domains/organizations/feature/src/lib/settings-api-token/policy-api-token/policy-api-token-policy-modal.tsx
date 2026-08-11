import { type OrganizationPolicyApiToken } from 'qovery-typescript-axios'
import { Button, CodeEditor } from '@qovery/shared/ui'

export interface PolicyApiTokenPolicyModalProps {
  token: OrganizationPolicyApiToken
  onClose: () => void
}

export function PolicyApiTokenPolicyModal({ token, onClose }: PolicyApiTokenPolicyModalProps) {
  return (
    <div className="p-6">
      <h2 className="h4 mb-1 max-w-full truncate text-neutral">Policy of {token.name}</h2>
      <p className="mb-6 text-xs text-neutral-subtle">
        Evaluated by Open Policy Agent on every request this token makes, and the only thing constraining it.
      </p>

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
