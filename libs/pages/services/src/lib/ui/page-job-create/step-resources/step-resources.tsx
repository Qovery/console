import { FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ApplicationSettingsResources } from '@qovery/shared/console-shared'
import { ApplicationResourcesData } from '@qovery/shared/interfaces'
import { Button, ButtonSize, ButtonStyle } from '@qovery/shared/ui'

export interface StepResourcesProps {
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function StepResources({ onBack, onSubmit }: StepResourcesProps) {
  const { formState } = useFormContext<ApplicationResourcesData>()

  return (
    <>
      <div className="mb-10">
        <h3 className="text-text-700 text-lg mb-2">Set resources</h3>
        <p className="text-xs text-text-500">Configure the resources required to run your job</p>
      </div>

      <form onSubmit={onSubmit}>
        <ApplicationSettingsResources displayWarningCpu={false} />

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
