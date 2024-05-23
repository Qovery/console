import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ApplicationSettingsResources } from '@qovery/shared/console-shared'
import { type ApplicationResourcesData } from '@qovery/shared/interfaces'
import { Button, Heading, Section } from '@qovery/shared/ui'

export interface StepResourcesProps {
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  maximumInstances?: number
}

export function StepResources({ maximumInstances, onSubmit, onBack }: StepResourcesProps) {
  const { formState } = useFormContext<ApplicationResourcesData>()

  return (
    <Section>
      <Heading className="mb-2">Resources</Heading>

      <form className="space-y-10" onSubmit={onSubmit}>
        <p className="text-sm text-neutral-350">Customize the resources assigned to the service.</p>
        <ApplicationSettingsResources maxInstances={maximumInstances} displayWarningCpu={false} />

        <div className="flex justify-between">
          <Button onClick={onBack} type="button" size="lg" variant="plain">
            Back
          </Button>
          <Button data-testid="button-submit" type="submit" disabled={!formState.isValid} size="lg">
            Continue
          </Button>
        </div>
      </form>
    </Section>
  )
}

export default StepResources
