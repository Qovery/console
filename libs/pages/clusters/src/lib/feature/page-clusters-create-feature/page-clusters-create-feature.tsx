import { KubernetesEnum } from 'qovery-typescript-axios'
import { createContext, useContext, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { AssistantTrigger } from '@qovery/shared/assistant/feature'
import {
  type ClusterFeaturesData,
  type ClusterGeneralData,
  type ClusterKubeconfigData,
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
  kubeconfigData: ClusterKubeconfigData | undefined
  setKubeconfigData: (data: ClusterKubeconfigData) => void
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

export const steps = (clusterGeneralData?: ClusterGeneralData, clusterType?: string) => {
  return match(clusterGeneralData)
    .with({ installation_type: 'SELF_MANAGED' }, () => [
      { title: 'Create new cluster', key: 'general' },
      { title: 'Kubeconfig', key: 'kubeconfig' },
      { title: 'Ready to install', key: 'summary' },
    ])
    .with({ installation_type: 'MANAGED', cloud_provider: 'SCW' }, () => [
      { title: 'Create new cluster', key: 'general' },
      { title: 'Set resources', key: 'resources' },
      { title: 'Ready to install', key: 'summary' },
    ])
    .with({ installation_type: 'MANAGED', cloud_provider: 'GCP' }, () => [
      { title: 'Create new cluster', key: 'general' },
      { title: 'Set features', key: 'features' },
      { title: 'Ready to install', key: 'summary' },
    ])
    .with({ installation_type: 'MANAGED', cloud_provider: 'AWS' }, undefined, () => {
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
  karpenter: {
    enabled: false,
    default_service_architecture: 'AMD64',
    disk_size_in_gib: '50',
    spot_enabled: false,
  },
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
  const [featuresData, setFeaturesData] = useState<ClusterFeaturesData | undefined>({
    vpc_mode: 'DEFAULT',
    features: {},
  })
  const [kubeconfigData, setKubeconfigData] = useState<ClusterKubeconfigData | undefined>()

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
        kubeconfigData,
        setKubeconfigData,
      }}
    >
      <FunnelFlow
        onExit={() => {
          navigate(CLUSTERS_URL(organizationId))
        }}
        totalSteps={steps(generalData, resourcesData?.cluster_type).length}
        currentStep={currentStep}
        currentTitle={steps(generalData, resourcesData?.cluster_type)[currentStep - 1]?.title}
      >
        <Routes>
          {ROUTER_CLUSTER_CREATION.map((route) => (
            <Route key={route.path} path={route.path} element={route.component} />
          ))}
          <Route path="*" element={<Navigate replace to={pathCreate + CLUSTERS_CREATION_GENERAL_URL} />} />
        </Routes>
        <AssistantTrigger defaultOpen />
      </FunnelFlow>
    </ClusterContainerCreateContext.Provider>
  )
}

export default PageClusterCreateFeature
