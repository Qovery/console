import { type JobLifecycleTypeEnum } from 'qovery-typescript-axios'
import { type Dispatch, type SetStateAction, createContext, useContext, useEffect, useState } from 'react'
import { type UseFormReturn, useForm } from 'react-hook-form'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { type DockerfileSettingsData } from '@qovery/domains/services/feature'
import { AssistantTrigger } from '@qovery/shared/assistant/feature'
import { type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import {
  type FlowVariableData,
  type JobConfigureData,
  type JobGeneralData,
  type JobResourcesData,
} from '@qovery/shared/interfaces'
import {
  SERVICES_CRONJOB_CREATION_URL,
  SERVICES_JOB_CREATION_GENERAL_URL,
  SERVICES_JOB_CREATION_INTRODUCTION_URL,
  SERVICES_LIFECYCLE_CREATION_URL,
  SERVICES_LIFECYCLE_TEMPLATE_CREATION_URL,
  SERVICES_NEW_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlow } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ROUTER_SERVICE_JOB_CREATION } from '../../router/router'
import { type ServiceTemplateOptionType } from '../page-new-feature/service-templates'
import { serviceTemplates } from '../page-new-feature/service-templates'
import { getLocalStorageStepIntroduction } from './step-introduction-feature/util-localstorage-step'
import { TemplateFormSync } from './template-form-sync'

export interface JobContainerCreateContextInterface {
  currentStep: number
  setCurrentStep: (step: number) => void
  generalData: JobGeneralData | undefined
  setGeneralData: Dispatch<SetStateAction<JobGeneralData | undefined>>

  dockerfileForm: UseFormReturn<DockerfileSettingsData>

  configureData: JobConfigureData | undefined
  setConfigureData: Dispatch<SetStateAction<JobConfigureData | undefined>>

  resourcesData: JobResourcesData | undefined
  setResourcesData: Dispatch<SetStateAction<JobResourcesData | undefined>>

  variableData: FlowVariableData | undefined
  setVariableData: Dispatch<SetStateAction<FlowVariableData | undefined>>

  jobType: JobType
  jobURL: string | undefined

  templateType: keyof typeof JobLifecycleTypeEnum | undefined
  setTemplateType: Dispatch<SetStateAction<JobLifecycleTypeEnum | undefined>>

  dockerfileDefaultContent?: string
  setDockerfileDefaultContent: Dispatch<SetStateAction<string | undefined>>
}

export const JobContainerCreateContext = createContext<JobContainerCreateContextInterface | undefined>(undefined)

export const useJobContainerCreateContext = () => {
  const applicationContainerCreateContext = useContext(JobContainerCreateContext)
  if (!applicationContainerCreateContext)
    throw new Error('useJobContainerCreateContext must be used within a JobContainerCreateContext')
  return applicationContainerCreateContext
}

export const steps = (jobType: JobType, hasIntroduction: boolean = false, hasDockerfile: boolean = true) => {
  const baseSteps = [
    { title: 'Create new job' },
    ...(hasDockerfile ? [{ title: 'Dockerfile' }] : []),
    { title: jobType === ServiceTypeEnum.CRON_JOB ? 'Job configuration' : 'Triggers' },
    { title: 'Set resources' },
    { title: 'Set variable environments' },
    { title: 'Ready to install' },
  ]

  if (hasIntroduction) {
    return [{ title: 'Introduction' }, ...baseSteps]
  }

  return baseSteps
}

export const getStepNumber = (
  stepName: string,
  jobType: JobType,
  serviceType?: keyof typeof ServiceTypeEnum,
  hasIntroduction: boolean = false
): number => {
  const hasDockerfile = serviceType === 'APPLICATION' && jobType !== ServiceTypeEnum.CRON_JOB
  const allSteps = steps(jobType, hasIntroduction, hasDockerfile)

  let stepIndex = -1

  switch (stepName) {
    case 'introduction':
      stepIndex = allSteps.findIndex((step) => step.title === 'Introduction')
      break
    case 'general':
      stepIndex = allSteps.findIndex((step) => step.title === 'Create new job')
      break
    case 'dockerfile':
      stepIndex = allSteps.findIndex((step) => step.title === 'Dockerfile')
      break
    case 'configure':
      stepIndex = allSteps.findIndex(
        (step) => step.title.includes('configuration') || step.title.includes('Triggers')
      )
      break
    case 'resources':
      stepIndex = allSteps.findIndex((step) => step.title === 'Set resources')
      break
    case 'variables':
      stepIndex = allSteps.findIndex((step) => step.title === 'Set variable environments')
      break
    case 'summary':
      stepIndex = allSteps.findIndex((step) => step.title === 'Ready to install')
      break
  }

  return stepIndex >= 0 ? stepIndex + 1 : 1
}

export const findTemplateData = (slug?: string, option?: string) => {
  return serviceTemplates.flatMap((template) => {
    if (template.slug === slug && !template.options) {
      return template
    }

    if (template.slug === slug && template.options?.length) {
      return template.options.find((o) => o.slug === option)
    }

    return []
  })[0]
}

export function PageJobCreateFeature() {
  const { organizationId = '', projectId = '', environmentId = '', slug, option } = useParams()
  const location = useLocation()
  const templateData = findTemplateData(slug, option)

  const [currentStep, setCurrentStep] = useState<number>(1)
  const [generalData, setGeneralData] = useState<JobGeneralData | undefined>()
  const [jobType, setJobType] = useState<JobType>(ServiceTypeEnum.CRON_JOB)
  const [jobURL, setJobURL] = useState<string | undefined>()
  const [templateType, setTemplateType] = useState<keyof typeof JobLifecycleTypeEnum>()
  const [dockerfileDefaultContent, setDockerfileDefaultContent] = useState<string>()

  const dockerfileForm = useForm<DockerfileSettingsData>({
    mode: 'onChange',
    defaultValues: {
      dockerfile_source: 'GIT_REPOSITORY',
    },
  })

  const [configureData, setConfigureData] = useState<JobConfigureData | undefined>()
  const [resourcesData, setResourcesData] = useState<JobResourcesData | undefined>({
    memory: 512,
    cpu: 500,
  })

  const [variableData, setVariableData] = useState<FlowVariableData | undefined>({
    variables: [],
  })

  const navigate = useNavigate()

  useDocumentTitle('Creation - Job')

  useEffect(() => {
    if (location.pathname.indexOf('cron') !== -1) {
      setJobURL(SERVICES_CRONJOB_CREATION_URL)
      setJobType(ServiceTypeEnum.CRON_JOB)
    } else {
      setJobType(ServiceTypeEnum.LIFECYCLE_JOB)
      setJobURL(
        slug && option ? SERVICES_LIFECYCLE_TEMPLATE_CREATION_URL(slug, option) : SERVICES_LIFECYCLE_CREATION_URL
      )
    }
  }, [setJobURL, setJobType, location.pathname, slug, option])

  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`

  const displayIntroductionView = jobType === ServiceTypeEnum.LIFECYCLE_JOB && !getLocalStorageStepIntroduction()

  const hasDockerfile = generalData?.serviceType === 'APPLICATION' && jobType !== ServiceTypeEnum.CRON_JOB
  const totalSteps = steps(jobType, displayIntroductionView, hasDockerfile)

  const funnel = (
    <FunnelFlow
      onExit={() => {
        if (window.confirm('Do you really want to leave?')) {
          const link = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_NEW_URL}`
          navigate(link)
        }
      }}
      totalSteps={totalSteps.length}
      currentStep={currentStep}
      currentTitle={totalSteps[currentStep - 1]?.title || 'Loading...'}
    >
      <Routes>
        {ROUTER_SERVICE_JOB_CREATION.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        {jobURL && (
          <Route
            path="*"
            element={
              <Navigate
                replace
                to={`${pathCreate}${displayIntroductionView ? SERVICES_JOB_CREATION_INTRODUCTION_URL : SERVICES_JOB_CREATION_GENERAL_URL}`}
              />
            }
          />
        )}
      </Routes>
      <AssistantTrigger defaultOpen />
    </FunnelFlow>
  )

  // Sync general data with frontend template data
  useEffect(() => {
    if (templateData) {
      setGeneralData((generalData) => ({
        ...(generalData ?? {}),
        auto_deploy: true,
        description: '',
        name: templateData.slug ?? '',
        serviceType: slug === 'container' ? 'CONTAINER' : 'APPLICATION',
        icon_uri: templateData.icon_uri,
      }))
    }
  }, [templateData, setGeneralData])

  return (
    <JobContainerCreateContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        generalData,
        setGeneralData,
        resourcesData,
        setResourcesData,
        jobType,
        jobURL,
        variableData,
        setVariableData,
        configureData,
        setConfigureData,
        dockerfileForm,
        templateType,
        setTemplateType,
        dockerfileDefaultContent,
        setDockerfileDefaultContent,
      }}
    >
      {templateData && 'template_id' in templateData && templateData.template_id ? (
        // Sync general data with backend template data
        <TemplateFormSync
          environmentId={environmentId}
          templateData={templateData as ServiceTemplateOptionType & { template_id: string }}
        >
          {funnel}
        </TemplateFormSync>
      ) : (
        funnel
      )}
    </JobContainerCreateContext.Provider>
  )
}

export default PageJobCreateFeature
