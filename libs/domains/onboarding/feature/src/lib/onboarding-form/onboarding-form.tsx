import { type PropsWithChildren } from 'react'
import { Button, Heading, Icon, Section } from '@qovery/shared/ui'

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
      className="flex max-h-[532px] w-full max-w-[480px] flex-col justify-between gap-6 overflow-y-auto rounded-2xl border border-neutral bg-background p-6 shadow-lg"
    >
      <Section className="gap-6">
        <div>
          <Heading level={1} className="mb-2 font-brand text-[28px] font-normal leading-9 text-neutral">
            {title}
          </Heading>
          <p className="text-base text-neutral-subtle">{description}</p>
        </div>
        <div className="flex flex-col gap-4 [&_.input]:min-h-12 [&_.input]:py-1.5">{children}</div>
      </Section>
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
