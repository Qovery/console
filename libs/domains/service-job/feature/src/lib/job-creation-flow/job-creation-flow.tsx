import { useLocation, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { type JobLifecycleTypeEnum } from 'qovery-typescript-axios'
import {
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { type UseFormReturn, useForm } from 'react-hook-form'
import { type ServiceTemplateOptionType } from '@qovery/domains/services/feature'
import { type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import {
  type FlowVariableData,
  type JobConfigureData,
  type JobGeneralData,
  type JobResourcesData,
} from '@qovery/shared/interfaces'
import { FunnelFlow } from '@qovery/shared/ui'
import { type DockerfileSettingsData } from '../dockerfile-settings/dockerfile-settings'
import { findTemplateData } from './job-create-utils/job-create-utils'
import { TemplateFormSync } from './template-form-sync'

export interface JobCreateContextInterface {
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

export const JobCreateContext = createContext<JobCreateContextInterface | undefined>(undefined)

// this is to avoid to set initial value twice https://stackoverflow.com/questions/49949099/react-createcontext-point-of-defaultvalue
export const useJobCreateContext = () => {
  const jobCreateContext = useContext(JobCreateContext)
  if (!jobCreateContext) throw new Error('useJobCreateContext must be used within a JobCreateContext')
  return jobCreateContext
}

export const getJobCreationSteps = (jobType: JobType) => [
  { title: 'Create new job' },
  { title: 'Dockerfile' },
  { title: jobType === ServiceTypeEnum.CRON_JOB ? 'Job configuration' : 'Triggers' },
  { title: 'Set resources' },
  { title: 'Set variable environments' },
  { title: 'Ready to install' },
]

export interface JobCreationFlowProps extends PropsWithChildren {
  creationFlowUrl: string
}

export function JobCreationFlow({ children, creationFlowUrl }: JobCreationFlowProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const { template, option } = useSearch({ strict: false })
  const location = useLocation()
  const navigate = useNavigate()
  const templateData = findTemplateData(template, option)

  const [currentStep, setCurrentStep] = useState(1)
  const [generalData, setGeneralData] = useState<JobGeneralData | undefined>(() => {
    // Pre-fill from template data for templates without a backend template_id (e.g. s3-cli).
    // Templates WITH a template_id are handled by <TemplateFormSync> which fetches from the
    // backend before rendering children, so StepGeneral always mounts with the right defaults.
    // For templates WITHOUT a template_id the funnel renders immediately, so we seed the state
    // here (lazy initializer runs once, synchronously, before the first render) to guarantee
    // StepGeneral's useForm sees the correct defaultValues on mount.
    if (templateData && !('template_id' in templateData && templateData.template_id)) {
      return {
        auto_deploy: true,
        description: '',
        name: templateData.slug,
        serviceType: templateData.slug === 'container' ? 'CONTAINER' : 'APPLICATION',
        icon_uri: templateData.icon_uri,
      } as JobGeneralData
    }
    return undefined
  })
  const [jobType, setJobType] = useState<JobType>(
    location.pathname.indexOf('cron') !== -1 ? ServiceTypeEnum.CRON_JOB : ServiceTypeEnum.LIFECYCLE_JOB
  )
  const jobCreationSteps = getJobCreationSteps(jobType)
  const [jobURL] = useState<string>(creationFlowUrl)
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
    gpu: 0,
  })

  const [variableData, setVariableData] = useState<FlowVariableData | undefined>({
    variables: [],
  })

  useEffect(() => {
    if (location.pathname.indexOf('cron') !== -1) {
      setJobType(ServiceTypeEnum.CRON_JOB)
    } else {
      setJobType(ServiceTypeEnum.LIFECYCLE_JOB)
    }
  }, [setJobType, location.pathname])

  const funnel = (
    <FunnelFlow
      onExit={() => {
        if (window.confirm('Do you really want to leave?')) {
          navigate({
            to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/new',
            params: {
              organizationId,
              projectId,
              environmentId,
            },
          })
        }
      }}
      totalSteps={jobCreationSteps.length}
      currentStep={currentStep}
      currentTitle={jobCreationSteps[currentStep - 1]?.title}
    >
      {children}
    </FunnelFlow>
  )

  return (
    <JobCreateContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        generalData,
        setGeneralData,
        dockerfileForm,
        configureData,
        setConfigureData,
        resourcesData,
        setResourcesData,
        variableData,
        setVariableData,
        jobType,
        jobURL,
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
    </JobCreateContext.Provider>
  )
}
