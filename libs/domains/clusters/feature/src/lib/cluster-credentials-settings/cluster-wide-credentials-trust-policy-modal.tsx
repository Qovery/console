import * as Dialog from '@radix-ui/react-dialog'
import { CopyButton, ExternalLink, Heading, Section } from '@qovery/shared/ui'

export interface ClusterWideCredentialsTrustPolicyModalProps {
  trustPolicy: string
}

export function ClusterWideCredentialsTrustPolicyModal({ trustPolicy }: ClusterWideCredentialsTrustPolicyModalProps) {
  return (
    <Section className="p-5">
      <Dialog.Title asChild>
        <Heading level={2} className="pr-8 text-lg text-neutral">
          Allow Qovery access
        </Heading>
      </Dialog.Title>
      <Dialog.Description asChild>
        <div className="mb-6 mt-2 flex flex-col gap-3 text-sm text-neutral-subtle">
          <p>Qovery requires extended credentials for the next deployment.</p>
          <p>
            Allow Qovery to assume your extended credentials IAM role by following the steps{' '}
            <ExternalLink
              href="https://www.qovery.com/docs/configuration/integrations/kubernetes/eks/managed#enable-%2F-disable-the-extended-credentials-iam-role"
              size="sm"
              className="inline-flex"
            >
              here
            </ExternalLink>
            .
          </p>
          <p>
            Once the Cloudformation is in status <code className="font-code text-neutral">UPDATE_COMPLETE</code>, the
            Trust Relationships should be:
          </p>
        </div>
      </Dialog.Description>
      <div className="relative">
        <textarea
          aria-label="Required IAM trust policy"
          readOnly
          value={trustPolicy}
          rows={trustPolicy.split('\n').length}
          spellCheck={false}
          className="block w-full resize-none rounded border border-neutral bg-surface-neutral-subtle p-3 pr-12 font-code text-xs text-neutral [field-sizing:content] focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong"
        />
        <CopyButton content={trustPolicy} iconOnly size="sm" className="absolute right-2 top-2" />
      </div>
    </Section>
  )
}
