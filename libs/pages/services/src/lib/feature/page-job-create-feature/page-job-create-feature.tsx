import { createContext, useContext, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { FlowVariableData } from '@qovery/shared/interfaces'
import {
  SERVICES_CRONJOB_CREATION_URL,
  SERVICES_JOB_CREATION_GENERAL_URL,
  SERVICES_LIFECYCLE_CREATION_URL,
  SERVICES_URL,
} from '@qovery/shared/router'
import { FunnelFlow } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { ROUTER_SERVICE_JOB_CREATION } from '../../router/router'
import { GeneralData, ResourcesData } from './job-creation-flow.interface'

export interface JobContainerCreateContextInterface {
  currentStep: number
  setCurrentStep: (step: number) => void
  generalData: GeneralData | undefined
  setGeneralData: (data: GeneralData) => void
  resourcesData: ResourcesData | undefined
  setResourcesData: (data: ResourcesData) => void

  variableData: FlowVariableData | undefined
  setVariableData: (data: FlowVariableData) => void

  jobType: 'cron' | 'lifecycle'
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
  { title: 'Set resources' },
  { title: 'Set port' },
  { title: 'Set variable environments' },
  { title: 'Ready to install' },
]

export function PageJobCreateFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const location = useLocation()

  // values and setters for context initialization
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [generalData, setGeneralData] = useState<GeneralData | undefined>()
  const [jobType, setJobType] = useState<'cron' | 'lifecycle'>('cron')
  const [jobURL, setJobURL] = useState<string | undefined>()
  const [resourcesData, setResourcesData] = useState<ResourcesData | undefined>({
    memory: 512,
    cpu: [0.5],
  })

  const [variableData, setVariableData] = useState<FlowVariableData | undefined>({
    variables: [],
  })

  const navigate = useNavigate()

  useDocumentTitle('Creation - Job')

  useEffect(() => {
    if (location.pathname.indexOf('cron') !== -1) {
      setJobURL(SERVICES_CRONJOB_CREATION_URL)
      setJobType('cron')
    } else {
      setJobType('lifecycle')
      setJobURL(SERVICES_LIFECYCLE_CREATION_URL)
    }
  }, [])

  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`

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
      }}
    >
      <FunnelFlow
        onExit={() => {
          navigate(SERVICES_URL(organizationId, projectId, environmentId))
        }}
        totalSteps={5}
        currentStep={currentStep}
        currentTitle={steps[currentStep - 1].title}
        portal
      >
        <Routes>
          {ROUTER_SERVICE_JOB_CREATION.map((route) => (
            <Route key={route.path} path={route.path} element={route.component} />
          ))}
          {jobURL && (
            <Route path="*" element={<Navigate replace to={pathCreate + SERVICES_JOB_CREATION_GENERAL_URL} />} />
          )}
        </Routes>
      </FunnelFlow>
    </JobContainerCreateContext.Provider>
  )
}

export default PageJobCreateFeature
