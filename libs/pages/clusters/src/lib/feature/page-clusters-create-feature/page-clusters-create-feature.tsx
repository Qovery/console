import { createContext, useContext, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { ClusterFeaturesData, ClusterGeneralData, ClusterResourcesData } from '@qovery/shared/interfaces'
import { CLUSTERS_CREATION_GENERAL_URL, CLUSTERS_CREATION_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { FunnelFlow } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { ROUTER_CLUSTER_CREATION } from '../../router/router'

export interface ClusterContainerCreateContextInterface {
  currentStep: number
  setCurrentStep: (step: number) => void
  generalData: ClusterGeneralData | undefined
  setGeneralData: (data: ClusterGeneralData) => void
  resourcesData: ClusterResourcesData | undefined
  setResourcesData: (data: ClusterResourcesData) => void
  featuresData: ClusterFeaturesData | undefined
  setFeaturesData: (data: ClusterFeaturesData) => void
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
  const { organizationId = '' } = useParams()

  // values and setters for context initialization
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [generalData, setGeneralData] = useState<ClusterGeneralData | undefined>()
  const [resourcesData, setResourcesData] = useState<ClusterResourcesData | undefined>({
    cluster_type: '',
    disk_size: 20,
    instance_type: '',
    nodes: [1, 2],
  })
  const [featuresData, setFeaturesData] = useState<ClusterFeaturesData | undefined>()

  const navigate = useNavigate()

  useDocumentTitle('Creation - Cluster')

  const pathCreate = `${CLUSTERS_URL(organizationId)}${CLUSTERS_CREATION_URL}`

  return (
    <ClusterContainerCreateContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        generalData,
        setGeneralData,
        resourcesData,
        setResourcesData,
        featuresData,
        setFeaturesData,
      }}
    >
      <FunnelFlow
        onExit={() => {
          navigate(CLUSTERS_URL(organizationId))
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
          <Route path="*" element={<Navigate replace to={pathCreate + CLUSTERS_CREATION_GENERAL_URL} />} />
        </Routes>
      </FunnelFlow>
    </ClusterContainerCreateContext.Provider>
  )
}

export default PageClusterCreateFeature
