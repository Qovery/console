import { Button, Icon } from '@qovery/shared/ui'
import { type ProviderDisplay } from './provider-display'

export interface StepConfirmProps {
  provider?: ProviderDisplay
  email?: string
  previousProvider?: ProviderDisplay
  onContinue: () => void
  onWrongAccount: () => void
}

export function StepConfirm({ provider, email, previousProvider, onContinue, onWrongAccount }: StepConfirmProps) {
  const showPreviousProviderHint = previousProvider && previousProvider.label !== provider?.label

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-secondary px-4">
      <div className="w-full max-w-[480px] rounded-2xl border border-neutral bg-surface-neutral-subtle shadow-[0_2px_5px_0_rgba(0,0,0,0.02),0_0_24px_0_rgba(0,0,0,0.04)]">
        <div className="rounded-2xl bg-background px-4 pb-6 pt-8 outline outline-[1px] outline-neutral sm:px-8">
          <img className="mx-auto mb-8 h-6" src="/assets/logos/logo-black.svg" alt="Qovery logo" />

          <h1 className="mb-2 text-center text-2xl font-medium text-neutral">Already have a Qovery account?</h1>
          <p className="mb-6 text-center text-sm text-neutral-subtle">
            You're about to create a brand new organization. If you already have a Qovery account, sign in with the
            right provider instead.
          </p>

          {provider && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-neutral p-4">
              <Icon name={provider.icon} width="20" className="shrink-0" />
              <div className="flex flex-col gap-1 leading-tight">
                <span className="text-sm font-medium text-neutral">Signed in with {provider.label}</span>
                {email && <span className="text-ssm text-neutral-subtle">{email}</span>}
              </div>
            </div>
          )}

          {showPreviousProviderHint && (
            <p className="mb-6 text-center text-ssm text-neutral-subtle">
              Last time on this browser, you signed in with {previousProvider?.label}.
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Button size="lg" className="w-full justify-center" onClick={onContinue}>
              Create my organization
            </Button>
            <Button variant="plain" color="brand" size="lg" className="w-full justify-center" onClick={onWrongAccount}>
              Switch account
            </Button>
          </div>

          <p className="mt-6 text-center text-ssm text-neutral-subtle">
            You can invite your team later.
          </p>
        </div>
      </div>
    </div>
  )
}

export default StepConfirm
