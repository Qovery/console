import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { defaultLivenessProbe, defaultReadinessProbe, probeFormatted } from '@qovery/shared/console-shared'
import { ProbeTypeEnum } from '@qovery/shared/enums'
import { HealthcheckData, ProbeExtended } from '@qovery/shared/interfaces'
import {
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_CREATION_PORTS_URL,
  SERVICES_CREATION_POST_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import StepHealthchecks from '../../../ui/page-application-create/step-healthchecks/step-healthchecks'
import { useApplicationContainerCreateContext } from '../page-application-create-feature'

export function StepHealthchecksFeature() {
  useDocumentTitle('Health checks - Create Application')
  const { setCurrentStep, portData, setPortData, generalData } = useApplicationContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()
  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`

  useEffect(() => {
    !generalData?.name &&
      navigate(
        `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}` +
          SERVICES_CREATION_GENERAL_URL
      )
  }, [generalData, navigate, environmentId, organizationId, projectId])

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Configuring the Health Checks"
      items={[
        'Health checks are automatic ways for Kubernetes to check the status of your application and decide if it can receive traffic or needs to be restarted (during the deployment and run phases)',
        'Liveness Probe: it verifies if the application has an healthy state. If it fails, the application is restarted',
        'Readiness Probe: it verifies if the application is ready to receive traffic',
        'If your application has special processing requirements (long start-up phase, re-load operations during the run) you can customize the liveness and readiness probes to match your needs (have a look at the documentation)',
      ]}
      helpSectionProps={{
        description: 'Need help? You may find these links useful',
        links: [
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#ports',
            linkLabel: 'How to configure my application',
            external: true,
          },
          { link: 'https://discuss.qovery.com/', linkLabel: 'Still need help? Ask on our Forum', external: true },
        ],
      }}
    />
  )

  useEffect(() => {
    setCurrentStep(4)
  }, [setCurrentStep])

  const methods = useForm({
    defaultValues: {
      readiness_probe: {
        ...{
          current_type: ProbeTypeEnum.TCP,
          type: {
            [ProbeTypeEnum.TCP.toLowerCase()]: {
              port: portData?.ports && portData?.ports.length > 0 ? portData?.ports[0].application_port : 0,
            },
          },
        },
        ...defaultReadinessProbe,
      },
      liveness_probe: {
        ...{
          current_type: 'NONE',
          type: {
            [ProbeTypeEnum.NONE.toLowerCase()]: null,
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
    const typeLiveness = data.liveness_probe.current_type
    const typeReadiness = data.readiness_probe.current_type

    setPortData({
      ports: portData?.ports || [],
      healthchecks: {
        typeLiveness: typeLiveness as string,
        typeReadiness: typeReadiness as string,
        item: {
          liveness_probe: probeFormatted(data.liveness_probe, portData?.ports[0].application_port) as ProbeExtended,
          readiness_probe: probeFormatted(data.readiness_probe, portData?.ports[0].application_port) as ProbeExtended,
        },
      },
    })

    navigate(pathCreate + SERVICES_CREATION_POST_URL)
  })

  const onBack = () => {
    navigate(pathCreate + SERVICES_CREATION_PORTS_URL)
  }

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <StepHealthchecks
          ports={portData?.ports}
          onBack={onBack}
          onSubmit={onSubmit}
          defaultTypeReadiness={(portData?.healthchecks?.typeReadiness as ProbeTypeEnum) || ProbeTypeEnum.TCP}
          defaultTypeLiveness={(portData?.healthchecks?.typeLiveness as ProbeTypeEnum) || ProbeTypeEnum.NONE}
        />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepHealthchecksFeature
