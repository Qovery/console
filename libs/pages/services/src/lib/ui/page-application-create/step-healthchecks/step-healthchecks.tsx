import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ApplicationSettingsHealthchecks } from '@qovery/shared/console-shared'
import { type PortData } from '@qovery/shared/interfaces'
import { ButtonLegacy, ButtonLegacySize, ButtonLegacyStyle, Heading, Section } from '@qovery/shared/ui'

export interface StepHealthchecksProps {
  onBack: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  ports?: PortData[]
}

export function StepHealthchecks({ ports, onSubmit, onBack }: StepHealthchecksProps) {
  const { formState } = useFormContext()

  return (
    <Section>
      <div className="mb-10">
        <Heading className="mb-2">Health checks</Heading>
        <p className="text-neutral-400 text-xs">
          Health checks are automatic ways for Kubernetes to check the status of your application and decide if it can
          receive traffic or needs to be restarted (during the deployment and run phases). These checks are managed by
          two probes: Liveness and Readiness. If your application has special processing requirements (long start-up
          phase, re-load operations during the run), you can customize the liveness and readiness probes to match your
          needs (have a look at the documentation)
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <ApplicationSettingsHealthchecks ports={ports?.map((port: PortData) => port.application_port || 0)} />

        <div className="flex justify-between mt-10">
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

export default StepHealthchecks
