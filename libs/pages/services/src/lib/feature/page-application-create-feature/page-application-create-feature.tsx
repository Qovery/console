import { createContext, useContext, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { ApplicationGeneralData, ApplicationResourcesData, FlowPortData } from '@qovery/shared/interfaces'
import { SERVICES_APPLICATION_CREATION_URL, SERVICES_CREATION_GENERAL_URL, SERVICES_URL } from '@qovery/shared/routes'
import { FunnelFlow } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { ROUTER_SERVICE_CREATION } from '../../router/router'

export interface ApplicationContainerCreateContextInterface {
  currentStep: number
  setCurrentStep: (step: number) => void
  generalData: ApplicationGeneralData | undefined
  setGeneralData: (data: ApplicationGeneralData) => void
  resourcesData: ApplicationResourcesData | undefined
  setResourcesData: (data: ApplicationResourcesData) => void
  portData: FlowPortData | undefined
  setPortData: (data: FlowPortData) => void
}

export const ApplicationContainerCreateContext = createContext<ApplicationContainerCreateContextInterface | undefined>(
  undefined
)

// this is to avoid to set initial value twice https://stackoverflow.com/questions/49949099/react-createcontext-point-of-defaultvalue
export const useApplicationContainerCreateContext = () => {
  const applicationContainerCreateContext = useContext(ApplicationContainerCreateContext)
  if (!applicationContainerCreateContext)
    throw new Error('useApplicationContainerCreateContext must be used within a ApplicationContainerCreateContext')
  return applicationContainerCreateContext
}

export const steps: { title: string }[] = [
  { title: 'Create new application' },
  { title: 'Set resources' },
  { title: 'Set port' },
  { title: 'Ready to install' },
]

export function PageApplicationCreateFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  // values and setters for context initialization
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [generalData, setGeneralData] = useState<ApplicationGeneralData | undefined>()
  const [resourcesData, setResourcesData] = useState<ApplicationResourcesData | undefined>({
    memory: 512,
    cpu: [0.5],
    instances: [1, 2],
  })

  const [portData, setPortData] = useState<FlowPortData | undefined>({
    ports: [],
  })

  const navigate = useNavigate()

  useDocumentTitle('Creation - Service')

  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`

  return (
    <ApplicationContainerCreateContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        generalData,
        setGeneralData,
        resourcesData,
        setResourcesData,
        portData,
        setPortData,
      }}
    >
      <FunnelFlow
        onExit={() => {
          navigate(SERVICES_URL(organizationId, projectId, environmentId))
        }}
        totalSteps={4}
        currentStep={currentStep}
        currentTitle={steps[currentStep - 1].title}
        portal
      >
        <Routes>
          {ROUTER_SERVICE_CREATION.map((route) => (
            <Route key={route.path} path={route.path} element={route.component} />
          ))}
          <Route path="*" element={<Navigate replace to={pathCreate + SERVICES_CREATION_GENERAL_URL} />} />
        </Routes>
      </FunnelFlow>
    </ApplicationContainerCreateContext.Provider>
  )
}

export default PageApplicationCreateFeature
