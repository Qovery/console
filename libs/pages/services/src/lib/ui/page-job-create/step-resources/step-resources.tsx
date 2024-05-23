import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ApplicationSettingsResources } from '@qovery/shared/console-shared'
import { type ApplicationResourcesData } from '@qovery/shared/interfaces'
import { Button, Heading, Section } from '@qovery/shared/ui'

export interface StepResourcesProps {
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function StepResources({ onBack, onSubmit }: StepResourcesProps) {
  const { formState } = useFormContext<ApplicationResourcesData>()

  return (
    <Section>
      <Heading className="mb-2">Resources</Heading>

      <form className="space-y-10" onSubmit={onSubmit}>
        <p className="text-sm text-neutral-350">Customize the resources assigned to the service.</p>
        <ApplicationSettingsResources displayWarningCpu={false} displayInstanceLimits={false} />

        <div className="flex justify-between">
          <Button onClick={onBack} type="button" size="lg" variant="plain">
            Back
          </Button>
          <Button datatest-id="button-submit" type="submit" disabled={!formState.isValid} size="lg">
            Continue
          </Button>
        </div>
      </form>
    </Section>
  )
}

export default StepResources
