import { FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ApplicationSettingsHealthchecks } from '@qovery/shared/console-shared'
import { PortData } from '@qovery/shared/interfaces'
import { Button, ButtonSize, ButtonStyle } from '@qovery/shared/ui'

export interface StepHealthchecksProps {
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  ports?: PortData[]
}

export function StepHealthchecks({ ports, onSubmit, onBack }: StepHealthchecksProps) {
  const { formState } = useFormContext()

  return (
    <>
      <div className="mb-10">
        <h3 className="text-text-700 text-lg mb-2">Health checks</h3>
        <p className="text-text-500 text-xs">
          Automated health checks allow to verify the status of your application and if it’s ready to receive incoming
          traffic. Kubernetes allows to configure two automatic probes checking the status of your application: Liveness
          and Readiness probes. Within this section you can specify the configuration for both these probes.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <ApplicationSettingsHealthchecks ports={ports?.map((port: PortData) => port.application_port || 0)} />

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

export default StepHealthchecks
