import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { defaultLivenessProbe, defaultReadinessProbe, probeFormatted } from '@qovery/shared/console-shared'
import { ProbeTypeEnum } from '@qovery/shared/enums'
import { type HealthcheckData, type ProbeExtended } from '@qovery/shared/interfaces'
import {
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_CREATION_PORTS_URL,
  SERVICES_CREATION_VARIABLES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import StepHealthchecks from '../../../ui/page-application-create/step-healthchecks/step-healthchecks'
import { useApplicationContainerCreateContext } from '../page-application-create-feature'

export function StepHealthchecksFeature() {
  useDocumentTitle('Health checks - Create Application')
  const { setCurrentStep, portData, setPortData, generalData, creationFlowUrl } = useApplicationContainerCreateContext()
  const navigate = useNavigate()

  useEffect(() => {
    !generalData?.name && navigate(creationFlowUrl + SERVICES_CREATION_GENERAL_URL)
  }, [generalData, navigate, creationFlowUrl])

  useEffect(() => {
    setCurrentStep(4)
  }, [setCurrentStep])

  const methods = useForm({
    defaultValues: {
      readiness_probe: {
        ...{
          current_type: portData?.healthchecks?.typeReadiness || ProbeTypeEnum.TCP,
          type: {
            [portData?.healthchecks?.typeReadiness || ProbeTypeEnum.TCP.toLowerCase()]: {
              port: portData?.ports && portData?.ports.length > 0 ? portData?.ports[0].application_port : 0,
            },
          },
        },
        ...defaultReadinessProbe,
      },
      liveness_probe: {
        ...{
          current_type: portData?.healthchecks?.typeLiveness || ProbeTypeEnum.TCP,
          type: {
            [portData?.healthchecks?.typeLiveness || ProbeTypeEnum.TCP]: {
              port: portData?.ports && portData?.ports.length > 0 ? portData?.ports[0].application_port : 0,
            },
          },
        },
        ...defaultLivenessProbe,
      },
    } as HealthcheckData,
    mode: 'onChange',
  })

  useEffect(() => {
    if (portData?.healthchecks?.item) {
      methods.reset(portData?.healthchecks?.item as HealthcheckData)
      methods.setValue('readiness_probe.current_type', portData.healthchecks.typeReadiness as ProbeTypeEnum)
      methods.setValue('liveness_probe.current_type', portData.healthchecks.typeLiveness as ProbeTypeEnum)
    }
  }, [methods, portData?.healthchecks])

  const onSubmit = methods.handleSubmit((data) => {
    const typeLiveness = data.liveness_probe ? data.liveness_probe.current_type : ProbeTypeEnum.NONE
    const typeReadiness = data.readiness_probe ? data.readiness_probe.current_type : ProbeTypeEnum.NONE

    setPortData({
      ports: portData?.ports || [],
      healthchecks: {
        typeLiveness: typeLiveness as string,
        typeReadiness: typeReadiness as string,
        item: {
          liveness_probe:
            data.liveness_probe && typeLiveness !== ProbeTypeEnum.NONE
              ? (probeFormatted(data.liveness_probe, portData?.ports?.[0].application_port) as ProbeExtended)
              : undefined,
          readiness_probe:
            data.readiness_probe && typeReadiness !== ProbeTypeEnum.NONE
              ? (probeFormatted(data.readiness_probe, portData?.ports?.[0].application_port) as ProbeExtended)
              : undefined,
        },
      },
    })

    navigate(creationFlowUrl + SERVICES_CREATION_VARIABLES_URL)
  })

  const onBack = () => {
    navigate(creationFlowUrl + SERVICES_CREATION_PORTS_URL)
  }

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepHealthchecks ports={portData?.ports} onBack={onBack} onSubmit={onSubmit} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepHealthchecksFeature
