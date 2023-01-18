import { createContext, useContext, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { ClusterGeneralData } from '@qovery/shared/interfaces'
import { SERVICES_APPLICATION_CREATION_URL, SERVICES_CREATION_GENERAL_URL, SERVICES_URL } from '@qovery/shared/routes'
import { FunnelFlow } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { ROUTER_CLUSTER_CREATION } from '../../router/router'

export interface ClusterContainerCreateContextInterface {
  currentStep: number
  setCurrentStep: (step: number) => void
  generalData: ClusterGeneralData | undefined
  setGeneralData: (data: ClusterGeneralData) => void
  // resourcesData: ApplicationResourcesData | undefined
  // setResourcesData: (data: ApplicationResourcesData) => void
}

export const ClusterContainerCreateContext = createContext<ClusterContainerCreateContextInterface | undefined>(
  undefined
)

// this is to avoid to set initial value twice https://stackoverflow.com/questions/49949099/react-createcontext-point-of-defaultvalue
export const useClusterContainerCreateContext = () => {
  const clusterContainerCreateContext = useContext(ClusterContainerCreateContext)
  if (!clusterContainerCreateContext)
    throw new Error('useClusterContainerCreateContext must be used within a ClusterContainerCreateContext')
  return clusterContainerCreateContext
}

export const steps: { title: string }[] = [
  { title: 'Create new cluster' },
  { title: 'Set resources' },
  { title: 'Set SSH Key' },
  { title: 'Set features' },
  { title: 'Ready to install' },
]

export function PageClusterCreateFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  // values and setters for context initialization
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [generalData, setGeneralData] = useState<ClusterGeneralData | undefined>()
  // const [resourcesData, setResourcesData] = useState<ApplicationResourcesData | undefined>({
  //   memory: 512,
  //   cpu: [0.5],
  //   instances: [1, 2],
  // })

  // const [portData, setPortData] = useState<FlowPortData | undefined>({
  //   ports: [],
  // })

  const navigate = useNavigate()

  useDocumentTitle('Creation - Service')

  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`

  return (
    <ClusterContainerCreateContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        generalData,
        setGeneralData,
        // resourcesData,
        // setResourcesData,
        // portData,
        // setPortData,
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
          {ROUTER_CLUSTER_CREATION.map((route) => (
            <Route key={route.path} path={route.path} element={route.component} />
          ))}
          <Route path="*" element={<Navigate replace to={pathCreate + SERVICES_CREATION_GENERAL_URL} />} />
        </Routes>
      </FunnelFlow>
    </ClusterContainerCreateContext.Provider>
  )
}

export default PageClusterCreateFeature
