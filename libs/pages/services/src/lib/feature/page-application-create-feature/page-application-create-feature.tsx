import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { SERVICES_APPLICATION_CREATION_URL, SERVICES_CREATION_GENERAL_URL, SERVICES_URL } from '@console/shared/router'
import { FunnelFlow } from '@console/shared/ui'
import { useDocumentTitle } from '@console/shared/utils'
import { ROUTER_SERVICE_CREATION } from '../../router/router'
import { GlobalData } from './interfaces.interface'

interface ApplicationContainerCreateContextInterface {
  currentStep: number
  setCurrentStep: (step: number) => void
  globalData: GlobalData | undefined
  setGlobalData: (data: GlobalData) => void
}

export const ApplicationContainerCreateContext = createContext<ApplicationContainerCreateContextInterface | undefined>(
  undefined
)

// this is to avoid to set initial value twice https://stackoverflow.com/questions/49949099/react-createcontext-point-of-defaultvalue
export const useApplicationContainerCreateContext = () => {
  const applicationContainerCreateContext = useContext(ApplicationContainerCreateContext)
  if (!applicationContainerCreateContext)
    throw new Error('No ApplicationContainerCreateContext.Provider found when calling useGridItemContext.')
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
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [globalData, setGlobalData] = useState<GlobalData | undefined>()
  const navigate = useNavigate()

  useDocumentTitle('Creation - Service')

  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`

  return (
    <ApplicationContainerCreateContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        globalData,
        setGlobalData,
      }}
    >
      <FunnelFlow
        onExit={() => {
          navigate(SERVICES_URL(organizationId, projectId, environmentId))
        }}
        totalSteps={4}
        currentStep={currentStep}
        currentTitle={steps[currentStep - 1].title}
      >
        <Routes>
          {ROUTER_SERVICE_CREATION.map((route) => (
            <Route key={route.path} path={route.path} element={route.component} />
          ))}
          <Route path="*" element={<Navigate to={pathCreate + SERVICES_CREATION_GENERAL_URL} />} />
        </Routes>
      </FunnelFlow>
    </ApplicationContainerCreateContext.Provider>
  )
}

export default PageApplicationCreateFeature
