import { type DatabaseTypeEnum } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { DatabaseSettingsResources } from '@qovery/shared/console-shared'
import { Button, Heading, Section } from '@qovery/shared/ui'
import { type ResourcesData } from '../../../feature/page-database-create-feature/database-creation-flow.interface'

export interface StepResourcesProps {
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  isManaged?: boolean
  databaseType?: DatabaseTypeEnum
}

export function StepResources({ onSubmit, isManaged, onBack, databaseType }: StepResourcesProps) {
  const { formState } = useFormContext<ResourcesData>()

  return (
    <Section>
      <Heading className="mb-2">General information</Heading>
      <form className="space-y-10" onSubmit={onSubmit}>
        <p className="text-sm text-neutral-350">Customize the resources assigned to the service.</p>

        <Section className="gap-4">
          <Heading>Resources configuration</Heading>
          <DatabaseSettingsResources isManaged={isManaged} databaseType={databaseType} />
        </Section>

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
