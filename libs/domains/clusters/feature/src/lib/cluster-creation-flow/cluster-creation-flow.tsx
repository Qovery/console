import { useNavigate, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import {
  CloudProviderEnum,
  type ClusterPlatformBindingRequest,
  type SecretManagerAccess,
} from 'qovery-typescript-axios'
import {
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { match } from 'ts-pattern'
import {
  type ClusterFeaturesData,
  type ClusterGeneralData,
  type ClusterKubeconfigData,
  type ClusterResourcesData,
} from '@qovery/shared/interfaces'
import { FunnelFlow } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { PLATFORM_CONFIGURATION_FEATURE_FLAG } from '../platform-configuration/platform-configuration-feature-flag'

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
  addonsData: ClusterAddonsData
  setAddonsData: Dispatch<SetStateAction<ClusterAddonsData>>
  platformConfigurationData?: ClusterPlatformBindingRequest
  setPlatformConfigurationData?: Dispatch<SetStateAction<ClusterPlatformBindingRequest | undefined>>
  isEngineV2SelfManaged?: boolean
  creationFlowUrl: string
}

export type ClusterAddonsData = {
  kedaActivated: boolean
  secretManagers: SecretManagerAccess[]
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

export const useMaybeClusterContainerCreateContext = () => useContext(ClusterContainerCreateContext)

export const steps = (clusterGeneralData?: ClusterGeneralData, isEngineV2SelfManaged = false) => {
  return match(clusterGeneralData)
    .with({ installation_type: 'PARTIALLY_MANAGED' }, () => [
      { title: 'Create new cluster', key: 'general' },
      { title: 'Kubeconfig', key: 'kubeconfig' },
      { title: 'EKS configuration', key: 'eks' },
      { title: 'Ready to install', key: 'summary' },
    ])
    .with({ installation_type: 'SELF_MANAGED' }, () =>
      isEngineV2SelfManaged
        ? [
            { title: 'Create new cluster', key: 'general' },
            { title: 'Platform layers', key: 'platform' },
            { title: 'Ready to install', key: 'summary' },
          ]
        : [
            { title: 'Create new cluster', key: 'general' },
            { title: 'Kubeconfig', key: 'kubeconfig' },
            { title: 'Ready to install', key: 'summary' },
          ]
    )
    .with({ installation_type: 'MANAGED', cloud_provider: 'SCW' }, () => [
      { title: 'Create new cluster', key: 'general' },
      { title: 'Resources', key: 'resources' },
      { title: 'Network configuration', key: 'features' },
      { title: 'Ready to install', key: 'summary' },
    ])
    .with({ installation_type: 'MANAGED', cloud_provider: 'GCP' }, () => [
      { title: 'Create new cluster', key: 'general' },
      { title: 'Set features', key: 'features' },
      { title: 'Add-ons', key: 'addons' },
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
      { title: 'Add-ons', key: 'addons' },
      { title: 'Ready to install', key: 'summary' },
    ])
    .otherwise(() => [])
}

export function isEngineV2SelfManagedFlow(slug: string | undefined, featureEnabled: boolean) {
  return featureEnabled && Boolean(slug?.endsWith('-self-managed'))
}

export const defaultResourcesData: ClusterResourcesData = {
  cluster_type: 'MANAGED',
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
  infrastructure_charts_parameters: {
    cert_manager_parameters: {
      kubernetes_namespace: '',
    },
    metal_lb_parameters: {
      ip_address_pools: [],
    },
    nginx_parameters: {
      replica_count: 1,
      default_ssl_certificate: '',
      publish_status_address: '',
      annotation_metal_lb_load_balancer_ips: '',
      annotation_external_dns_kubernetes_target: '',
    },
  },
}

export function ClusterCreationFlow({ children }: PropsWithChildren) {
  const { organizationId = '', slug } = useParams({ strict: false })
  // values and setters for context initialization
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [generalData, setGeneralData] = useState<ClusterGeneralData | undefined>()
  const [resourcesData, setResourcesData] = useState<ClusterResourcesData | undefined>(defaultResourcesData)
  const [featuresData, setFeaturesData] = useState<ClusterFeaturesData | undefined>({
    vpc_mode: undefined,
    features: {},
  })
  const [kubeconfigData, setKubeconfigData] = useState<ClusterKubeconfigData | undefined>()
  const [addonsData, setAddonsData] = useState<ClusterAddonsData>({
    kedaActivated: false,
    secretManagers: [],
  })
  const [platformConfigurationData, setPlatformConfigurationData] = useState<
    ClusterPlatformBindingRequest | undefined
  >()
  const isPlatformConfigurationEnabled = useFeatureFlagEnabled(PLATFORM_CONFIGURATION_FEATURE_FLAG)
  const isEngineV2SelfManaged = isEngineV2SelfManagedFlow(slug, Boolean(isPlatformConfigurationEnabled))

  const navigate = useNavigate()

  useDocumentTitle('Creation - Cluster')

  const creationFlowUrl = `/organization/${organizationId}/cluster/create/${slug}`
  const currentSteps = steps(generalData, isEngineV2SelfManaged)

  useEffect(() => {
    if (slug) {
      const defaultOptions: Partial<ClusterGeneralData> | undefined = match(slug)
        .when(
          () => isEngineV2SelfManaged,
          () => {
            const provider = slug.replace(/-self-managed$/, '').toUpperCase()
            if (!Object.values(CloudProviderEnum).includes(provider as CloudProviderEnum)) return undefined

            return {
              installation_type: 'SELF_MANAGED' as const,
              cloud_provider: provider as CloudProviderEnum,
            }
          }
        )
        .with('aws-eks-anywhere', () => ({
          installation_type: 'PARTIALLY_MANAGED' as ClusterGeneralData['installation_type'],
          cloud_provider: CloudProviderEnum.AWS,
          region: 'eu-west-3', // Default selected region for EKS Anywhere flow
        }))
        .with('aws', () => ({
          installation_type: 'MANAGED' as ClusterGeneralData['installation_type'],
          cloud_provider: CloudProviderEnum.AWS,
        }))
        .with('scw', () => ({
          installation_type: 'MANAGED' as ClusterGeneralData['installation_type'],
          cloud_provider: CloudProviderEnum.SCW,
        }))
        .with('gcp', () => ({
          installation_type: 'MANAGED' as ClusterGeneralData['installation_type'],
          cloud_provider: CloudProviderEnum.GCP,
        }))
        .with('azure', () => ({
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
  }, [isEngineV2SelfManaged, setGeneralData, slug])

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
        addonsData,
        setAddonsData,
        platformConfigurationData,
        setPlatformConfigurationData,
        isEngineV2SelfManaged,
        creationFlowUrl,
      }}
    >
      <FunnelFlow
        onExit={() => {
          if (window.confirm('Do you really want to leave?')) {
            navigate({
              to: '/organization/$organizationId/cluster/new',
              params: { organizationId },
            })
          }
        }}
        totalSteps={currentSteps.length}
        currentStep={currentStep}
        currentTitle={currentSteps[currentStep - 1]?.title}
      >
        {children}
      </FunnelFlow>
    </ClusterContainerCreateContext.Provider>
  )
}

export default ClusterCreationFlow
