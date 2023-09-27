import { type EnvironmentModeEnum } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ApplicationSettingsResources } from '@qovery/shared/console-shared'
import { type ApplicationResourcesData } from '@qovery/shared/interfaces'
import { ButtonLegacy, ButtonLegacySize, ButtonLegacyStyle } from '@qovery/shared/ui'

export interface StepResourcesProps {
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  environmentMode?: EnvironmentModeEnum
}

export function StepResources({ onBack, environmentMode, onSubmit }: StepResourcesProps) {
  const { formState } = useFormContext<ApplicationResourcesData>()

  return (
    <>
      <div className="mb-10">
        <h3 className="text-neutral-400 text-lg mb-2">Set resources</h3>
        <p className="text-xs text-neutral-400">Configure the resources required to run your job</p>
      </div>

      <form onSubmit={onSubmit}>
        <ApplicationSettingsResources displayWarningCpu={false} environmentMode={environmentMode} />

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
    </>
  )
}

export default StepResources
