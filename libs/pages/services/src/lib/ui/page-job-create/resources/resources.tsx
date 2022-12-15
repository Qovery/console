import { FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { SettingResources } from '@qovery/shared/console-shared'
import { ApplicationResourcesData } from '@qovery/shared/interfaces'
import { Button, ButtonSize, ButtonStyle } from '@qovery/shared/ui'

export interface ResourcesProps {
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function Resources(props: ResourcesProps) {
  const { formState } = useFormContext<ApplicationResourcesData>()

  return (
    <>
      <div className="mb-10">
        <h3 className="text-text-700 text-lg mb-2">Set resources</h3>
      </div>

      <form onSubmit={props.onSubmit}>
        <SettingResources displayWarningCpu={false} />

        <div className="flex justify-between">
          <Button
            onClick={props.onBack}
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

export default Resources
