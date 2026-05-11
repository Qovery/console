import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { ProbeTypeEnum } from '@qovery/shared/enums'
import { type HealthcheckData } from '@qovery/shared/interfaces'
import { Button, FunnelFlowBody, Heading, Link, Section } from '@qovery/shared/ui'
import { useApplicationContainerCreateContext } from '../../service-creation-flow/application-container/application-container-creation-flow'
import { ApplicationContainerHealthchecksForm } from '../application-container-healthchecks-form/application-container-healthchecks-form'
import {
  buildHealthchecksPayload,
  defaultLivenessProbe,
  defaultReadinessProbe,
  resetHealthchecksFormFromValue,
} from '../healthchecks-utils'

export interface ApplicationContainerStepHealthchecksSubmitData {
  healthchecksData: HealthcheckData
}

export interface ApplicationContainerStepHealthchecksProps {
  onBack: () => void
  onSubmit: (data: ApplicationContainerStepHealthchecksSubmitData) => void | Promise<void>
  loading?: boolean
}

export function ApplicationContainerStepHealthchecks({
  onBack,
  onSubmit,
  loading = false,
}: ApplicationContainerStepHealthchecksProps) {
  const { portForm, setCurrentStep } = useApplicationContainerCreateContext()
  const ports = portForm.watch('ports') ?? []
  const defaultPort = ports[0]?.application_port
  const methods = useForm<HealthcheckData>({
    mode: 'onChange',
    defaultValues: {
      readiness_probe: {
        current_type: ProbeTypeEnum.TCP,
        type: {
          tcp: {
            port: defaultPort ?? 0,
          },
        },
        ...defaultReadinessProbe,
      },
      liveness_probe: {
        current_type: ProbeTypeEnum.TCP,
        type: {
          tcp: {
            port: defaultPort ?? 0,
          },
        },
        ...defaultLivenessProbe,
      },
    },
  })

  useEffect(() => {
    setCurrentStep(4)
  }, [setCurrentStep])

  useEffect(() => {
    if (portForm.getValues('healthchecks')?.item) {
      resetHealthchecksFormFromValue(methods, portForm.getValues('healthchecks')?.item)
      return
    }

    methods.reset({
      readiness_probe: {
        current_type: ProbeTypeEnum.TCP,
        type: {
          tcp: {
            port: defaultPort ?? 0,
          },
        },
        ...defaultReadinessProbe,
      },
      liveness_probe: {
        current_type: ProbeTypeEnum.TCP,
        type: {
          tcp: {
            port: defaultPort ?? 0,
          },
        },
        ...defaultLivenessProbe,
      },
    })
  }, [defaultPort, methods, portForm, ports])

  const handleSubmit = methods.handleSubmit(() => {
    const healthchecksData = methods.getValues()

    portForm.setValue('healthchecks', buildHealthchecksPayload(healthchecksData, defaultPort), {
      shouldDirty: true,
    })

    onSubmit({ healthchecksData })
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <Section className="space-y-10">
            <div className="flex flex-col gap-2">
              <Heading>Health checks</Heading>
              <p className="text-sm text-neutral-subtle">
                Configure liveness and readiness probes for the ports exposed by your service.
              </p>
            </div>

            <ApplicationContainerHealthchecksForm ports={ports.map((port) => port.application_port ?? 0)} />

            <div className="flex items-center justify-between">
              <Link as="button" size="lg" type="button" variant="plain" color="neutral" onClick={onBack}>
                Back
              </Link>

              <Button type="submit" size="lg" loading={loading}>
                Continue
              </Button>
            </div>
          </Section>
        </form>
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default ApplicationContainerStepHealthchecks
