import { type PropsWithChildren } from 'react'
import { Button, Heading, Icon, Section } from '@qovery/shared/ui'

export interface OnboardingFormProps extends PropsWithChildren {
  title: string
  description: string
  onSubmit: () => void
  loading?: boolean
  disabled?: boolean
}

export function OnboardingForm({ title, description, onSubmit, loading, disabled, children }: OnboardingFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-[124px]">
      <Section className="gap-6">
        <div className="motion-safe:animate-[slidein-up-sm_240ms_cubic-bezier(0.165,0.84,0.44,1)_both,fadein_200ms_cubic-bezier(0.165,0.84,0.44,1)_both] motion-reduce:animate-[fadein_120ms_cubic-bezier(0.165,0.84,0.44,1)]">
          <Heading level={1} className="mb-2 font-brand text-[28px] font-normal leading-9 text-neutral">
            {title}
          </Heading>
          <p className="text-base text-neutral-subtle">{description}</p>
        </div>
        <div className="flex flex-col gap-4 motion-safe:animate-[slidein-up-sm_240ms_cubic-bezier(0.165,0.84,0.44,1)_both,fadein_200ms_cubic-bezier(0.165,0.84,0.44,1)_both] motion-safe:[animation-delay:40ms] motion-reduce:animate-[fadein_120ms_cubic-bezier(0.165,0.84,0.44,1)]">
          {children}
        </div>
      </Section>
      <div className="flex flex-col gap-2 motion-safe:animate-[slidein-up-sm_240ms_cubic-bezier(0.165,0.84,0.44,1)_both,fadein_200ms_cubic-bezier(0.165,0.84,0.44,1)_both] motion-safe:[animation-delay:80ms] motion-reduce:animate-[fadein_120ms_cubic-bezier(0.165,0.84,0.44,1)]">
        <Button
          type="submit"
          size="lg"
          color="neutral"
          className="w-full justify-center text-base font-medium"
          loading={loading}
          disabled={disabled || loading}
        >
          Continue <Icon iconName="arrow-right" iconStyle="solid" className="text-base" />
        </Button>
      </div>
    </form>
  )
}
