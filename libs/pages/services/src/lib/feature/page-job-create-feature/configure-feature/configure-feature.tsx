import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import {
  SERVICES_JOB_CREATION_GENERAL_URL,
  SERVICES_JOB_CREATION_RESOURCES_URL,
  SERVICES_URL,
} from '@qovery/shared/router'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import Configure from '../../../ui/page-job-create/configure/configure'
import { ConfigureData } from '../job-creation-flow.interface'
import { useJobContainerCreateContext } from '../page-job-create-feature'

export function ConfigureFeature() {
  useDocumentTitle('Configure - Create Job')
  const { configureData, setConfigureData, setCurrentStep, jobURL, jobType } = useJobContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Cronjob creation"
      items={[
        'You can deploy an application from a git repository or a container registry',
        'Git Repository: Qovery will pull the repository, build the application and deploy it on your kubernetes cluster',
        'Container Registry: Qovery will pull the image from container registry and deploy it on your kubernetes cluster',
      ]}
      helpSectionProps={{
        description: 'Need help? You may find these links useful',
        links: [
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#general',
            linkLabel: 'How to configure my application',
            external: true,
          },
          { link: 'https://discuss.qovery.com/', linkLabel: 'Still need help? Ask on our Forum', external: true },
        ],
      }}
    />
  )

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const methods = useForm<ConfigureData>({
    defaultValues: configureData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    const cloneData = {
      ...data,
    }

    setConfigureData(cloneData)
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`
    navigate(pathCreate + SERVICES_JOB_CREATION_RESOURCES_URL)
  })

  const onBack = () => {
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`
    navigate(pathCreate + SERVICES_JOB_CREATION_GENERAL_URL)
  }

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <Configure onSubmit={onSubmit} onBack={onBack} jobType={jobType} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default ConfigureFeature
