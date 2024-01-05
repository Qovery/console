import { type CloudProviderEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { createContext, useContext, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import {
  type ClusterFeaturesData,
  type ClusterGeneralData,
  type ClusterRemoteData,
  type ClusterResourcesData,
} from '@qovery/shared/interfaces'
import { CLUSTERS_CREATION_GENERAL_URL, CLUSTERS_CREATION_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { FunnelFlow } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ROUTER_CLUSTER_CREATION } from '../../router/router'

export interface ClusterContainerCreateContextInterface {
  currentStep: number
  setCurrentStep: (step: number) => void
  generalData: ClusterGeneralData | undefined
  setGeneralData: (data: ClusterGeneralData) => void
  resourcesData: ClusterResourcesData | undefined
  setResourcesData: (data: ClusterResourcesData) => void
  featuresData: ClusterFeaturesData | undefined
  setFeaturesData: (data: ClusterFeaturesData | undefined) => void
  remoteData: ClusterRemoteData | undefined
  setRemoteData: (data: ClusterRemoteData) => void
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

export const steps = (cloudProvider?: CloudProviderEnum, clusterType?: string) => {
  return match(cloudProvider)
    .with('SCW', () => [
      { title: 'Create new cluster', key: 'general' },
      { title: 'Set resources', key: 'resources' },
      { title: 'Ready to install', key: 'summary' },
    ])
    .with('GCP', () => [
      { title: 'Create new cluster', key: 'general' },
      { title: 'Ready to install', key: 'summary' },
    ])
    .with('AWS', () => {
      if (clusterType === KubernetesEnum.K3_S) {
        return [
          { title: 'Create new cluster', key: 'general' },
          { title: 'Set resources', key: 'resources' },
          { title: 'Set SSH Key', key: 'remote' },
          { title: 'Ready to install', key: 'summary' },
        ]
      } else {
        return [
          { title: 'Create new cluster', key: 'general' },
          { title: 'Set resources', key: 'resources' },
          { title: 'Set features', key: 'features' },
          { title: 'Ready to install', key: 'summary' },
        ]
      }
    })
    .otherwise(() => [])
}

export const defaultResourcesData: ClusterResourcesData = {
  cluster_type: '',
  disk_size: 50,
  instance_type: '',
  nodes: [3, 10],
}

export function PageClusterCreateFeature() {
  const { organizationId = '' } = useParams()

  // values and setters for context initialization
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [generalData, setGeneralData] = useState<ClusterGeneralData | undefined>()
  const [remoteData, setRemoteData] = useState<ClusterRemoteData | undefined>({
    ssh_key: '',
  })
  const [resourcesData, setResourcesData] = useState<ClusterResourcesData | undefined>(defaultResourcesData)
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
        remoteData,
        setRemoteData,
        featuresData,
        setFeaturesData,
      }}
    >
      <FunnelFlow
        onExit={() => {
          navigate(CLUSTERS_URL(organizationId))
        }}
        totalSteps={steps(generalData?.cloud_provider, resourcesData?.cluster_type).length}
        currentStep={currentStep}
        currentTitle={steps(generalData?.cloud_provider, resourcesData?.cluster_type)[currentStep - 1]?.title}
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
