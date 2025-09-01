import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type Dispatch, type SetStateAction, createContext, useContext, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { AssistantTrigger } from '@qovery/shared/assistant/feature'
import {
  type ClusterFeaturesData,
  type ClusterGeneralData,
  type ClusterKubeconfigData,
  type ClusterResourcesData,
} from '@qovery/shared/interfaces'
import {
  CLUSTERS_CREATION_GENERAL_URL,
  CLUSTERS_CREATION_URL,
  CLUSTERS_NEW_URL,
  CLUSTERS_TEMPLATE_CREATION_URL,
  CLUSTERS_URL,
} from '@qovery/shared/routes'
import { FunnelFlow } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ROUTER_CLUSTER_CREATION } from '../../router/router'

export interface ClusterContainerCreateContextInterface {
  currentStep: number
  setCurrentStep: Dispatch<SetStateAction<number>>
  generalData: ClusterGeneralData | undefined
  setGeneralData: Dispatch<SetStateAction<ClusterGeneralData | undefined>>
  resourcesData: ClusterResourcesData | undefined
  setResourcesData: Dispatch<SetStateAction<ClusterResourcesData | undefined>>
  featuresData: ClusterFeaturesData | undefined
  setFeaturesData: Dispatch<SetStateAction<ClusterFeaturesData | undefined>>
  kubeconfigData: ClusterKubeconfigData | undefined
  setKubeconfigData: Dispatch<SetStateAction<ClusterKubeconfigData | undefined>>
  creationFlowUrl: string
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

export const steps = (clusterGeneralData?: ClusterGeneralData) => {
  return match(clusterGeneralData)
    .with({ installation_type: 'PARTIALLY_MANAGED' }, () => [
      { title: 'Create new cluster', key: 'general' },
      { title: 'Kubeconfig', key: 'kubeconfig' },
      { title: 'EKS configuration', key: 'eks' },
      { title: 'Ready to install', key: 'summary' },
    ])
    .with({ installation_type: 'SELF_MANAGED' }, () => [
      { title: 'Create new cluster', key: 'general' },
      { title: 'Kubeconfig', key: 'kubeconfig' },
      { title: 'Ready to install', key: 'summary' },
    ])
    .with({ installation_type: 'MANAGED', cloud_provider: 'SCW' }, () => [
      { title: 'Create new cluster', key: 'general' },
      { title: 'Resources', key: 'resources' },
      { title: 'Ready to install', key: 'summary' },
    ])
    .with({ installation_type: 'MANAGED', cloud_provider: 'GCP' }, () => [
      { title: 'Create new cluster', key: 'general' },
      { title: 'Set features', key: 'features' },
      { title: 'Ready to install', key: 'summary' },
    ])
    .with({ installation_type: 'MANAGED', cloud_provider: 'AZURE' }, () => [
      { title: 'Create new cluster', key: 'general' },
      { title: 'Resources', key: 'resources' },
      { title: 'Ready to install', key: 'summary' },
    ])
    .with({ installation_type: 'MANAGED', cloud_provider: 'AWS' }, undefined, () => [
      { title: 'Create new cluster', key: 'general' },
      { title: 'Resources', key: 'resources' },
      { title: 'Network', key: 'features' },
      { title: 'Ready to install', key: 'summary' },
    ])
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
    disk_size_in_gib: 50,
    spot_enabled: false,
    qovery_node_pools: {
      requirements: [],
    },
  },
  replica_count: 1,
  publish_status_address: '',
  default_ssl_certificate: '',
  annotation_metal_lb_load_balancer_ips: '',
  annotation_external_dns_kubernetes_target: '',
}

export function PageClusterCreateFeature() {
  const { organizationId = '', slug } = useParams()

  // values and setters for context initialization
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [generalData, setGeneralData] = useState<ClusterGeneralData | undefined>()
  const [resourcesData, setResourcesData] = useState<ClusterResourcesData | undefined>(defaultResourcesData)
  const [featuresData, setFeaturesData] = useState<ClusterFeaturesData | undefined>({
    vpc_mode: undefined,
    features: {},
  })
  const [kubeconfigData, setKubeconfigData] = useState<ClusterKubeconfigData | undefined>()

  const navigate = useNavigate()

  useDocumentTitle('Creation - Cluster')

  const pathCreate = slug ? CLUSTERS_TEMPLATE_CREATION_URL(slug) : CLUSTERS_CREATION_URL
  const creationFlowUrl = CLUSTERS_URL(organizationId) + pathCreate

  useEffect(() => {
    if (slug) {
      const defaultOptions: Partial<ClusterGeneralData> | undefined = match(slug)
        .with('AWS-eks-anywhere', () => ({
          installation_type: 'PARTIALLY_MANAGED' as ClusterGeneralData['installation_type'],
          cloud_provider: CloudProviderEnum.AWS,
        }))
        .with('AWS', () => ({
          installation_type: 'MANAGED' as ClusterGeneralData['installation_type'],
          cloud_provider: CloudProviderEnum.AWS,
        }))
        .with('SCW', () => ({
          installation_type: 'MANAGED' as ClusterGeneralData['installation_type'],
          cloud_provider: CloudProviderEnum.SCW,
        }))
        .with('GCP', () => ({
          installation_type: 'MANAGED' as ClusterGeneralData['installation_type'],
          cloud_provider: CloudProviderEnum.GCP,
        }))
        .with('AZURE', () => ({
          installation_type: 'MANAGED' as ClusterGeneralData['installation_type'],
          cloud_provider: CloudProviderEnum.AZURE,
        }))
        .otherwise(() => undefined)
      if (defaultOptions) {
        setGeneralData({
          ...(defaultOptions as ClusterGeneralData),
        })
      }
    }
  }, [setGeneralData, slug])

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
        kubeconfigData,
        setKubeconfigData,
        creationFlowUrl,
      }}
    >
      <FunnelFlow
        onExit={() => {
          if (window.confirm('Do you really want to leave?')) {
            navigate(CLUSTERS_URL(organizationId) + CLUSTERS_NEW_URL)
          }
        }}
        totalSteps={steps(generalData).length}
        currentStep={currentStep}
        currentTitle={steps(generalData)[currentStep - 1]?.title}
      >
        <Routes>
          {ROUTER_CLUSTER_CREATION.map((route) => (
            <Route key={route.path} path={route.path} element={route.component} />
          ))}
          <Route path="*" element={<Navigate replace to={creationFlowUrl + CLUSTERS_CREATION_GENERAL_URL} />} />
        </Routes>
        <AssistantTrigger defaultOpen />
      </FunnelFlow>
    </ClusterContainerCreateContext.Provider>
  )
}

export default PageClusterCreateFeature
