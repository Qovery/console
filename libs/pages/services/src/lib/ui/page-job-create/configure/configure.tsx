import { FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { JobConfigureSettings } from '@qovery/shared/console-shared'
import { JobConfigureData } from '@qovery/shared/interfaces'
import { Button, ButtonSize, ButtonStyle } from '@qovery/shared/ui'

export interface ConfigureProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  onBack: () => void
  jobType: 'cron' | 'lifecycle'
}

export function Configure(props: ConfigureProps) {
  const { formState } = useFormContext<JobConfigureData>()

  return (
    <div>
      <div className="mb-10">
        <h3 className="text-text-700 text-lg mb-2">Job configuration</h3>
        <p className="text-text-500 text-sm mb-2">
          lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget aliquam
        </p>
      </div>

      <JobConfigureSettings jobType={props.jobType} />

      <form onSubmit={props.onSubmit}>
        <div className="flex justify-between">
          <Button
            onClick={props.onBack}
            type="button"
            className="btn--no-min-w"
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
    </div>
  )
}

export default Configure
