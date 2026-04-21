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
import { type DockerfileSettingsData } from '@qovery/domains/services/feature'
import { type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import {
  type FlowVariableData,
  type JobConfigureData,
  type JobGeneralData,
  type JobResourcesData,
} from '@qovery/shared/interfaces'
import { FunnelFlow } from '@qovery/shared/ui'
import { findTemplateData } from './job-create-utils/job-create-utils'

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

function getLifecycleType(option?: string): JobLifecycleTypeEnum {
  if (option?.includes('terraform')) {
    return 'TERRAFORM'
  }

  if (option?.includes('cloudformation')) {
    return 'CLOUDFORMATION'
  }

  return 'GENERIC'
}

export interface JobCreationFlowProps extends PropsWithChildren {
  creationFlowUrl: string
}

export function JobCreationFlow({ children, creationFlowUrl }: JobCreationFlowProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const { template, option } = useSearch({ strict: false })
  const location = useLocation()
  const navigate = useNavigate()
  const jobCreationSteps = getJobCreationSteps(ServiceTypeEnum.LIFECYCLE_JOB)

  const templateData = findTemplateData(template, option)
  const [currentStep, setCurrentStep] = useState(1)
  const defaultGeneralData = {
    name: templateData?.slug ?? '',
    description: '',
    icon_uri: templateData?.icon_uri,
    auto_deploy: true,
    serviceType: templateData?.type === 'CONTAINER' ? ServiceTypeEnum.CONTAINER : ServiceTypeEnum.APPLICATION,
  }
  const [generalData, setGeneralData] = useState<JobGeneralData | undefined>(defaultGeneralData)
  const [jobType, setJobType] = useState<JobType>(
    location.pathname.indexOf('cron') !== -1 ? ServiceTypeEnum.CRON_JOB : ServiceTypeEnum.LIFECYCLE_JOB
  )
  const [jobURL] = useState<string>(creationFlowUrl)
  const [templateType, setTemplateType] = useState<keyof typeof JobLifecycleTypeEnum>(getLifecycleType(option))
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
    </JobCreateContext.Provider>
  )
}
