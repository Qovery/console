import { DatabaseTypeEnum } from 'qovery-typescript-axios'
import { FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { DatabaseSettingsResources } from '@qovery/shared/console-shared'
import { Button, ButtonSize, ButtonStyle } from '@qovery/shared/ui'
import { ResourcesData } from '../../../feature/page-database-create-feature/database-creation-flow.interface'

export interface StepResourcesProps {
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  isManaged?: boolean
  databaseType?: DatabaseTypeEnum
}

export function StepResources({ onSubmit, isManaged, onBack, databaseType }: StepResourcesProps) {
  const { formState } = useFormContext<ResourcesData>()

  return (
    <>
      <div className="mb-10">
        <h3 className="text-text-700 text-lg mb-2">Set resources</h3>
        <p className="text-sm text-text-500 max-w-content-with-navigation-left">
          You can customize some of the resources assigned to the database.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <DatabaseSettingsResources
          isDatabase
          isManaged={isManaged}
          displayWarningCpu={false}
          databaseType={databaseType}
        />

        <div className="flex justify-between">
          <Button
            onClick={onBack}
            className="btn--no-min-w"
            type="button"
            size={ButtonSize.XLARGE}
            style={ButtonStyle.STROKED}
          >
            Back
          </Button>
          <Button
            dataTestId="button-submit"
            type="submit"
            disabled={!formState.isValid}
            size={ButtonSize.XLARGE}
            style={ButtonStyle.BASIC}
          >
            Continue
          </Button>
        </div>
      </form>
    </>
  )
}

export default StepResources
