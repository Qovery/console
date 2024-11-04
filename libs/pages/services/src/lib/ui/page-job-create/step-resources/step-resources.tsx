import { type JobLifecycleTypeEnum } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { ApplicationSettingsResources } from '@qovery/shared/console-shared'
import { type ApplicationResourcesData } from '@qovery/shared/interfaces'
import { Button, Callout, Heading, Icon, Section } from '@qovery/shared/ui'

export interface StepResourcesProps {
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  templateType?: JobLifecycleTypeEnum
}

export function StepResources({ templateType, onBack, onSubmit }: StepResourcesProps) {
  const { formState } = useFormContext<ApplicationResourcesData>()

  return (
    <Section>
      <Heading className="mb-2">Resources</Heading>

      <form className="space-y-10" onSubmit={onSubmit}>
        <p className="text-sm text-neutral-350">Customize the resources assigned to the service.</p>
        {match(templateType)
          .with('CLOUDFORMATION', 'TERRAFORM', () => (
            <Callout.Root color="sky">
              <Callout.Icon>
                <Icon iconName="circle-info" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                Qovery provides you with a default value for the resources to be used to run this job on your cluster.
                We recommend to test it with these value and customize these later.
              </Callout.Text>
            </Callout.Root>
          ))
          .with('GENERIC', undefined, () => undefined)
          .exhaustive()}
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
