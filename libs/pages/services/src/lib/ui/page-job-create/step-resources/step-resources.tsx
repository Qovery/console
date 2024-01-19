import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ApplicationSettingsResources } from '@qovery/shared/console-shared'
import { type ApplicationResourcesData } from '@qovery/shared/interfaces'
import { ButtonLegacy, ButtonLegacySize, ButtonLegacyStyle, Heading, Section } from '@qovery/shared/ui'

export interface StepResourcesProps {
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function StepResources({ onBack, onSubmit }: StepResourcesProps) {
  const { formState } = useFormContext<ApplicationResourcesData>()

  return (
    <Section>
      <div className="mb-10">
        <Heading className="mb-2">Set resources</Heading>
        <p className="text-xs text-neutral-400">Configure the resources required to run your job</p>
      </div>

      <form onSubmit={onSubmit}>
        <ApplicationSettingsResources displayWarningCpu={false} />

        <div className="flex justify-between">
          <ButtonLegacy
            onClick={onBack}
            className="btn--no-min-w"
            type="button"
            size={ButtonLegacySize.XLARGE}
            style={ButtonLegacyStyle.STROKED}
          >
            Back
          </ButtonLegacy>
          <ButtonLegacy
            dataTestId="button-submit"
            type="submit"
            disabled={!formState.isValid}
            size={ButtonLegacySize.XLARGE}
            style={ButtonLegacyStyle.BASIC}
          >
            Continue
          </ButtonLegacy>
        </div>
      </form>
    </Section>
  )
}

export default StepResources
