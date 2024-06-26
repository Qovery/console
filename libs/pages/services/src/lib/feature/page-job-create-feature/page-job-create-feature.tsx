import { useFeatureFlagEnabled } from 'posthog-js/react'
import { createContext, useContext, useEffect, useState } from 'react'
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
  SERVICES_GENERAL_URL,
  SERVICES_JOB_CREATION_GENERAL_URL,
  SERVICES_LIFECYCLE_CREATION_URL,
  SERVICES_LIFECYCLE_TEMPLATE_CREATION_URL,
  SERVICES_NEW_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlow } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ROUTER_SERVICE_JOB_CREATION } from '../../router/router'
import { serviceTemplates } from '../page-new-feature/service-templates'

export interface JobContainerCreateContextInterface {
  currentStep: number
  setCurrentStep: (step: number) => void
  generalData: JobGeneralData | undefined
  setGeneralData: (data: JobGeneralData) => void

  dockerfileForm: UseFormReturn<DockerfileSettingsData>

  configureData: JobConfigureData | undefined
  setConfigureData: (data: JobConfigureData) => void

  resourcesData: JobResourcesData | undefined
  setResourcesData: (data: JobResourcesData) => void

  variableData: FlowVariableData | undefined
  setVariableData: (data: FlowVariableData) => void

  jobType: JobType
  jobURL: string | undefined
}

export const JobContainerCreateContext = createContext<JobContainerCreateContextInterface | undefined>(undefined)

// this is to avoid to set initial value twice https://stackoverflow.com/questions/49949099/react-createcontext-point-of-defaultvalue
export const useJobContainerCreateContext = () => {
  const applicationContainerCreateContext = useContext(JobContainerCreateContext)
  if (!applicationContainerCreateContext)
    throw new Error('useJobContainerCreateContext must be used within a JobContainerCreateContext')
  return applicationContainerCreateContext
}

export const steps: { title: string }[] = [
  { title: 'Create new job' },
  { title: 'Job Configuration' },
  { title: 'Set resources' },
  { title: 'Set variable environments' },
  { title: 'Ready to install' },
]

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

  // values and setters for context initialization
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [generalData, setGeneralData] = useState<JobGeneralData | undefined>()
  const [jobType, setJobType] = useState<JobType>(ServiceTypeEnum.CRON_JOB)
  const [jobURL, setJobURL] = useState<string | undefined>()

  const dockerfileForm = useForm<DockerfileSettingsData>({
    mode: 'onChange',
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

  const flagEnabled = useFeatureFlagEnabled('service-dropdown-list')

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
      }}
    >
      <FunnelFlow
        onExit={() => {
          const link = `${SERVICES_URL(organizationId, projectId, environmentId)}${
            flagEnabled ? SERVICES_GENERAL_URL : SERVICES_NEW_URL
          }`
          navigate(link)
        }}
        totalSteps={5}
        currentStep={currentStep}
        currentTitle={steps[currentStep - 1].title}
      >
        <Routes>
          {ROUTER_SERVICE_JOB_CREATION.map((route) => (
            <Route key={route.path} path={route.path} element={route.component} />
          ))}
          {jobURL && (
            <Route path="*" element={<Navigate replace to={pathCreate + SERVICES_JOB_CREATION_GENERAL_URL} />} />
          )}
        </Routes>
        <AssistantTrigger defaultOpen />
      </FunnelFlow>
    </JobContainerCreateContext.Provider>
  )
}

export default PageJobCreateFeature
