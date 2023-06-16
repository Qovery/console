import { FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ApplicationSettingsHealthchecks } from '@qovery/shared/console-shared'
import { ProbeTypeEnum, ProbeTypeWithNoneEnum } from '@qovery/shared/enums'
import { PortData } from '@qovery/shared/interfaces'
import { Button, ButtonSize, ButtonStyle } from '@qovery/shared/ui'

export interface StepHealthchecksProps {
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  defaultTypeReadiness: ProbeTypeEnum
  defaultTypeLiveness: ProbeTypeWithNoneEnum
  ports?: PortData[]
}

export function StepHealthchecks({
  ports,
  onSubmit,
  onBack,
  defaultTypeReadiness,
  defaultTypeLiveness,
}: StepHealthchecksProps) {
  const { formState } = useFormContext()

  return (
    <>
      <div className="mb-10">
        <h3 className="text-text-700 text-lg mb-2">Health checks</h3>
        <p className="text-text-500 text-xs">
          Health checks are automatic ways for Kubernetes to check the status of your application and decide if it can
          receive traffic or needs to be restarted (during the deployment and run phases). These checks are managed by
          two probes: Liveness and Readiness. If your application has special processing requirements (long start-up
          phase, re-load operations during the run), you can customize the liveness and readiness probes to match your
          needs (have a look at the documentation)
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <ApplicationSettingsHealthchecks
          defaultTypeReadiness={defaultTypeReadiness}
          defaultTypeLiveness={defaultTypeLiveness}
          ports={ports?.map((port: PortData) => port.application_port || 0)}
        />

        <div className="flex justify-between mt-10">
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

export default StepHealthchecks
