import { type DatabaseTypeEnum } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { DatabaseSettingsResources } from '@qovery/shared/console-shared'
import { ButtonLegacy, ButtonLegacySize, ButtonLegacyStyle, Heading, Section } from '@qovery/shared/ui'
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
      <div className="mb-10">
        <Heading className="mb-2">Set resources</Heading>
        <p className="text-sm text-neutral-400 max-w-content-with-navigation-left">
          You can customize some of the resources assigned to the database.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <DatabaseSettingsResources isDatabase isManaged={isManaged} databaseType={databaseType} />

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
