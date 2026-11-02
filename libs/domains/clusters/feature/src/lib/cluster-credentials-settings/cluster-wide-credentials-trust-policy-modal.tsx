import * as Dialog from '@radix-ui/react-dialog'
import { CopyButton, Heading, Section } from '@qovery/shared/ui'

export interface ClusterWideCredentialsTrustPolicyModalProps {
  trustPolicy: string
}

export function ClusterWideCredentialsTrustPolicyModal({ trustPolicy }: ClusterWideCredentialsTrustPolicyModalProps) {
  return (
    <Section className="gap-4 p-5">
      <Dialog.Title asChild>
        <Heading level={2} className="pr-8 text-lg text-neutral">
          Allow Qovery access
        </Heading>
      </Dialog.Title>
      <Dialog.Description className="text-sm text-neutral-subtle">
        Qovery requires extended credentials for the next deployment. Allow Qovery to assume your extended credentials
        IAM role by adding the following trust policy under Trust relationships in AWS IAM.
      </Dialog.Description>
      <div className="relative">
        <textarea
          aria-label="Required IAM trust policy"
          readOnly
          value={trustPolicy}
          rows={trustPolicy.split('\n').length}
          spellCheck={false}
          className="block w-full resize-none rounded border border-neutral bg-surface-neutral-subtle p-3 pr-12 font-code text-sm text-neutral [field-sizing:content] focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong"
        />
        <CopyButton content={trustPolicy} iconOnly size="sm" className="absolute right-2 top-2" />
      </div>
    </Section>
  )
}
