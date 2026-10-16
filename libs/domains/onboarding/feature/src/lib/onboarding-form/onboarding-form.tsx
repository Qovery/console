import { type PropsWithChildren } from 'react'
import { Button, Icon } from '@qovery/shared/ui'

export interface OnboardingFormProps extends PropsWithChildren {
  title: string
  description: string
  onSubmit: () => void
  loading?: boolean
  disabled?: boolean
  onBack?: () => void
}

export function OnboardingForm({
  title,
  description,
  onSubmit,
  loading,
  disabled,
  onBack,
  children,
}: OnboardingFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex min-h-[620px] w-full max-w-[480px] flex-col justify-between gap-6 rounded-2xl border border-neutral bg-background p-6 shadow-lg"
    >
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="mb-2 font-brand text-[28px] font-normal leading-9 text-neutral">{title}</h1>
          <p className="text-base text-neutral-subtle">{description}</p>
        </div>
        <div className="flex flex-col gap-4 [&_.input]:min-h-12 [&_.input]:py-1.5">{children}</div>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          type="submit"
          size="lg"
          color="neutral"
          className="w-full justify-center text-base"
          loading={loading}
          disabled={disabled || loading}
        >
          Continue <Icon iconName="arrow-right" />
        </Button>
        {onBack && (
          <Button
            type="button"
            size="lg"
            color="neutral"
            variant="plain"
            className="w-full justify-center"
            onClick={onBack}
            disabled={loading}
          >
            Back
          </Button>
        )}
      </div>
    </form>
  )
}
