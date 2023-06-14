import { Healthcheck } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ProbeTypeEnum,
  ProbeTypeWithNoneEnum,
  defaultLivenessProbe,
  defaultReadinessProbe,
} from '@qovery/shared/console-shared'
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
          type: {
            [ProbeTypeWithNoneEnum.NONE.toLowerCase()]: null,
          },
        },
        ...defaultLivenessProbe,
      },
    },
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data: Healthcheck) => {
    function processProbeData(data: Healthcheck): Healthcheck {
      const processedData: Healthcheck = { ...data }

      if (processedData.liveness_probe && processedData.liveness_probe.type) {
        const livenessType = processedData.liveness_probe.type
        if (Object.keys(livenessType).includes('none')) {
          processedData.liveness_probe = undefined
        }
      }

      return processedData
    }

    console.log(processProbeData(data))

    setPortData({
      ports: portData?.ports || [],
      healthchecks: processProbeData(data) as Healthcheck,
    })

    navigate(pathCreate + SERVICES_CREATION_POST_URL)
  })

  const onBack = () => {
    navigate(pathCreate + SERVICES_CREATION_PORTS_URL)
  }

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <StepHealthchecks ports={portData?.ports} onBack={onBack} onSubmit={onSubmit} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepHealthchecksFeature
