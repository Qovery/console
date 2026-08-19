import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum, type Cluster, type KarpenterNodePoolRequirement } from 'qovery-typescript-axios'
import { act } from 'react'
import { useFormContext } from 'react-hook-form'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterResourcesSettings } from './cluster-resources-settings'

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()

// Stable identities: the effects seeding Karpenter requirements depend on these, so returning a
// fresh array on every render would keep re-triggering them. A real API response is non-empty.
const mockKarpenterInstanceTypes = [{ name: 'c5.large', cpu: 2, ram_in_gb: 4, architecture: 'AMD64', type: 'c5.large' }]
const mockKarpenterRequirements = [{ key: 'Arch', operator: 'In', values: ['AMD64'] }]

jest.mock('@qovery/domains/cloud-providers/feature', () => ({
  ...jest.requireActual('@qovery/domains/cloud-providers/feature'),
  useCloudProviderInstanceTypes: () => ({
    data: [
      { name: 't3.medium', cpu: 2, ram_in_gb: 4, architecture: 'AMD64', type: 't3.medium' },
      { name: 't4g.medium', cpu: 2, ram_in_gb: 4, architecture: 'ARM64', type: 't4g.medium' },
    ],
  }),
  useCloudProviderInstanceTypesKarpenter: () => ({ data: mockKarpenterInstanceTypes }),
  ClusterSCWControlPlaneFeature: () => <div data-testid="scw-control-plane">SCW Control Plane</div>,
  KarpenterInstanceFilterModal: () => null,
  KarpenterInstanceTypePreview: () => <div data-testid="karpenter-preview">Karpenter Preview</div>,
  convertToKarpenterRequirements: () => mockKarpenterRequirements,
}))

jest.mock('../gpu-resources-settings/gpu-resources-settings', () => ({
  GpuResourcesSettings: () => <div data-testid="gpu-resources-settings">GPU Settings</div>,
}))

jest.mock('../nodepools-resources-settings/nodepools-resources-settings', () => ({
  __esModule: true,
  default: () => <div data-testid="nodepools-settings">Nodepools Settings</div>,
  NodepoolsResourcesSettings: () => <div data-testid="nodepools-settings">Nodepools Settings</div>,
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
}))

const defaultValues: ClusterResourcesData = {
  instance_type: 't3.medium',
  disk_size: 50,
  cluster_type: 'MANAGED',
  nodes: [3, 10],
}

const creationRequirements: KarpenterNodePoolRequirement[] = [{ key: 'Arch', operator: 'In', values: ['AMD64'] }]

const cluster = {
  region: 'us-east-1',
  features: [
    {
      id: 'KARPENTER',
      value: {
        default_service_architecture: 'AMD64',
      },
    },
  ],
} as Cluster

function FormValuesProbe() {
  const { watch } = useFormContext<ClusterResourcesData>()

  return <pre data-testid="karpenter-values">{JSON.stringify(watch('karpenter'))}</pre>
}

describe('ClusterResourcesSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.scrollTo = jest.fn()
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <ClusterResourcesSettings clusterRegion="us-east-1" fromDetail={false} cloudProvider={CloudProviderEnum.AWS} />,
        { defaultValues }
      )
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render instance type selector when karpenter is disabled', () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <ClusterResourcesSettings clusterRegion="us-east-1" fromDetail={false} cloudProvider={CloudProviderEnum.SCW} />,
        { defaultValues }
      )
    )

    expect(screen.getByText('Resources configuration')).toBeInTheDocument()
  })

  it('should render AWS cost banner for AWS provider', () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <ClusterResourcesSettings clusterRegion="us-east-1" fromDetail={false} cloudProvider={CloudProviderEnum.AWS} />,
        { defaultValues: { ...defaultValues, karpenter: { enabled: false } } }
      )
    )

    expect(screen.getByTestId('aws-cost-banner')).toBeInTheDocument()
  })

  it('should render SCW control plane feature for Scaleway provider', () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <ClusterResourcesSettings clusterRegion="fr-par" fromDetail={false} cloudProvider={CloudProviderEnum.SCW} />,
        { defaultValues }
      )
    )

    expect(screen.getByTestId('scw-control-plane')).toBeInTheDocument()
  })

  it('should render nodes auto-scaling section for non-AWS providers', () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <ClusterResourcesSettings clusterRegion="fr-par" fromDetail={false} cloudProvider={CloudProviderEnum.SCW} />,
        { defaultValues }
      )
    )

    expect(screen.getByText('Nodes auto-scaling')).toBeInTheDocument()
    expect(screen.getByText('min 3 - max 10')).toBeInTheDocument()
  })

  it('should render disk size input when fromDetail is true', () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <ClusterResourcesSettings clusterRegion="fr-par" fromDetail={true} cloudProvider={CloudProviderEnum.SCW} />,
        { defaultValues }
      )
    )

    expect(screen.getByLabelText('Disk size (GB)')).toBeInTheDocument()
  })

  it('should not render AWS cost banner when fromDetail is true', () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <ClusterResourcesSettings clusterRegion="us-east-1" fromDetail={true} cloudProvider={CloudProviderEnum.AWS} />,
        { defaultValues: { ...defaultValues, karpenter: { enabled: false } } }
      )
    )

    expect(screen.queryByTestId('aws-cost-banner')).not.toBeInTheDocument()
  })

  it('should render Karpenter section for AWS with managed cluster type', () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <ClusterResourcesSettings clusterRegion="us-east-1" fromDetail={false} cloudProvider={CloudProviderEnum.AWS} />,
        { defaultValues }
      )
    )

    expect(screen.getByText('Reduce your costs with Karpenter')).toBeInTheDocument()
  })

  it('should render GPU nodepools configuration for AWS', () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <ClusterResourcesSettings clusterRegion="us-east-1" fromDetail={false} cloudProvider={CloudProviderEnum.AWS} />,
        { defaultValues }
      )
    )

    expect(screen.getByText('GPU nodepools configuration')).toBeInTheDocument()
    expect(screen.getByText('Enable GPU nodepools')).toBeInTheDocument()
  })

  it('should preserve nodepool overrides when changing Karpenter instance types scope', () => {
    const stableOverride = {
      limits: {
        enabled: false,
        max_cpu_in_vcpu: 6,
        max_memory_in_gibibytes: 10,
      },
      consolidation: {
        enabled: true,
        days: ['SUNDAY'],
        start_time: 'PT10:00',
        duration: 'PT2H',
      },
      consolidate_after: '30s',
    }
    const defaultOverride = {
      limits: {
        enabled: false,
        max_cpu_in_vcpu: 6,
        max_memory_in_gibibytes: 10,
      },
      consolidate_after: '30m',
    }

    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <>
          <ClusterResourcesSettings
            cluster={cluster}
            clusterRegion="us-east-1"
            fromDetail
            cloudProvider={CloudProviderEnum.AWS}
          />
          <FormValuesProbe />
        </>,
        {
          defaultValues: {
            ...defaultValues,
            karpenter: {
              enabled: true,
              default_service_architecture: 'AMD64',
              qovery_node_pools: {
                requirements: [{ key: 'InstanceSize', operator: 'In', values: ['2xlarge'] }],
                stable_override: stableOverride,
                default_override: defaultOverride,
              },
            },
          },
        }
      )
    )

    act(() => {
      screen.getByRole('button', { name: /edit/i }).click()
    })

    const modalContent = mockOpenModal.mock.calls[0][0].content as {
      props: {
        onChange: (values: {
          default_service_architecture: 'ARM64'
          qovery_node_pools: {
            requirements: Array<{ key: string; operator: string; values: string[] }>
          }
        }) => void
      }
    }

    act(() => {
      modalContent.props.onChange({
        default_service_architecture: 'ARM64',
        qovery_node_pools: {
          requirements: [{ key: 'InstanceSize', operator: 'In', values: ['4xlarge'] }],
        },
      })
    })

    expect(JSON.parse(screen.getByTestId('karpenter-values').textContent ?? '{}')).toEqual(
      expect.objectContaining({
        spot_enabled: false,
        disk_size_in_gib: 50,
        default_service_architecture: 'ARM64',
        qovery_node_pools: {
          requirements: [{ key: 'InstanceSize', operator: 'In', values: ['4xlarge'] }],
          stable_override: stableOverride,
          default_override: defaultOverride,
        },
      })
    )
  })

  it('should not render any spot toggle outside the nodepool modals when fromDetail is true', () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <ClusterResourcesSettings
          cluster={cluster}
          clusterRegion="us-east-1"
          fromDetail
          cloudProvider={CloudProviderEnum.AWS}
        />,
        {
          defaultValues: {
            ...defaultValues,
            karpenter: {
              enabled: true,
              spot_enabled: false,
              disk_size_in_gib: 50,
              default_service_architecture: 'AMD64',
              qovery_node_pools: {
                requirements: [],
                default_override: { spot_enabled: true },
                stable_override: { spot_enabled: false },
                gpu_override: { spot_enabled: true },
              },
            },
          },
        }
      )
    )

    expect(screen.queryByText(/^Enable spot instances/)).not.toBeInTheDocument()
    expect(screen.queryByText(/The stable nodepool hosts interruption-sensitive workloads/)).not.toBeInTheDocument()
  })

  it('should render the GPU spot toggle in creation mode and update the form value', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <>
          <ClusterResourcesSettings
            clusterRegion="us-east-1"
            fromDetail={false}
            cloudProvider={CloudProviderEnum.AWS}
          />
          <FormValuesProbe />
        </>,
        {
          defaultValues: {
            ...defaultValues,
            karpenter: {
              enabled: true,
              spot_enabled: false,
              disk_size_in_gib: 50,
              default_service_architecture: 'AMD64',
              qovery_node_pools: {
                requirements: creationRequirements,
                gpu_override: { disk_size_in_gib: 100 },
              },
            },
          },
        }
      )
    )

    const gpuSpotToggle = screen.getByRole('switch', { name: 'Enable spot instances on your GPU nodepools' })
    expect(gpuSpotToggle).not.toBeChecked()

    await userEvent.click(gpuSpotToggle)

    expect(
      JSON.parse(screen.getByTestId('karpenter-values').textContent ?? '{}').qovery_node_pools.gpu_override
    ).toEqual({ disk_size_in_gib: 100, spot_enabled: true })
  })

  it('should not render the inline GPU spot toggle when fromDetail is true', () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <ClusterResourcesSettings
          cluster={cluster}
          clusterRegion="us-east-1"
          fromDetail
          cloudProvider={CloudProviderEnum.AWS}
        />,
        {
          defaultValues: {
            ...defaultValues,
            karpenter: {
              enabled: true,
              spot_enabled: false,
              disk_size_in_gib: 50,
              default_service_architecture: 'AMD64',
              qovery_node_pools: {
                requirements: [],
                gpu_override: { disk_size_in_gib: 100, spot_enabled: true },
              },
            },
          },
        }
      )
    )

    expect(screen.queryByText('Enable spot instances on your GPU nodepools')).not.toBeInTheDocument()
  })

  it('should explain the per-nodepool spot mapping in the production callout during creation', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <ClusterResourcesSettings
          clusterRegion="us-east-1"
          fromDetail={false}
          isProduction
          cloudProvider={CloudProviderEnum.AWS}
        />,
        {
          defaultValues: {
            ...defaultValues,
            karpenter: {
              enabled: true,
              spot_enabled: false,
              disk_size_in_gib: 50,
              default_service_architecture: 'AMD64',
              qovery_node_pools: { requirements: creationRequirements },
            },
          },
        }
      )
    )

    await userEvent.click(screen.getByRole('switch', { name: 'Enable spot instances on your cluster' }))

    expect(screen.getByText(/The stable nodepool keeps on-demand instances/)).toBeInTheDocument()
    expect(
      screen.queryByText(/may lead to potential downtime for applications deployed on the stable node pool/)
    ).not.toBeInTheDocument()
  })

  it('should render the cluster-wide spot toggle in creation mode', () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <ClusterResourcesSettings clusterRegion="us-east-1" fromDetail={false} cloudProvider={CloudProviderEnum.AWS} />,
        {
          defaultValues: {
            ...defaultValues,
            karpenter: {
              enabled: true,
              spot_enabled: false,
              disk_size_in_gib: 50,
              default_service_architecture: 'AMD64',
              qovery_node_pools: { requirements: creationRequirements },
            },
          },
        }
      )
    )

    expect(screen.getByRole('switch', { name: 'Enable spot instances on your cluster' })).toBeInTheDocument()
    expect(screen.queryByText('Enable spot instances on the default nodepool')).not.toBeInTheDocument()
    expect(screen.queryByText('Enable spot instances on the stable nodepool')).not.toBeInTheDocument()
  })

  it('should seed the cronjob spot value from the default nodepool when enabling the cronjob nodepool', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <>
          <ClusterResourcesSettings
            cluster={cluster}
            clusterRegion="us-east-1"
            fromDetail
            cloudProvider={CloudProviderEnum.AWS}
          />
          <FormValuesProbe />
        </>,
        {
          defaultValues: {
            ...defaultValues,
            karpenter: {
              enabled: true,
              spot_enabled: false,
              disk_size_in_gib: 50,
              default_service_architecture: 'AMD64',
              qovery_node_pools: {
                requirements: [],
                default_override: { spot_enabled: true },
                stable_override: { spot_enabled: false },
              },
            },
          },
        }
      )
    )

    await userEvent.click(screen.getByRole('switch', { name: 'Enable cronjob nodepools' }))

    expect(JSON.parse(screen.getByTestId('karpenter-values').textContent ?? '{}').qovery_node_pools).toEqual({
      requirements: [],
      default_override: { spot_enabled: true },
      stable_override: { spot_enabled: false },
      cronjob_override: { spot_enabled: true },
    })
  })

  it('should remove the cronjob override when disabling the cronjob nodepool', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <>
          <ClusterResourcesSettings
            cluster={cluster}
            clusterRegion="us-east-1"
            fromDetail
            cloudProvider={CloudProviderEnum.AWS}
          />
          <FormValuesProbe />
        </>,
        {
          defaultValues: {
            ...defaultValues,
            karpenter: {
              enabled: true,
              spot_enabled: false,
              disk_size_in_gib: 50,
              default_service_architecture: 'AMD64',
              qovery_node_pools: {
                requirements: [],
                default_override: { spot_enabled: false },
                stable_override: { spot_enabled: false },
                cronjob_override: { spot_enabled: true, consolidate_after: '1m' },
              },
            },
          },
        }
      )
    )

    await userEvent.click(screen.getByRole('switch', { name: 'Enable cronjob nodepools' }))

    expect(JSON.parse(screen.getByTestId('karpenter-values').textContent ?? '{}').qovery_node_pools).not.toHaveProperty(
      'cronjob_override'
    )
  })

  it('should not seed a cronjob spot value when enabling the cronjob nodepool in creation mode', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <>
          <ClusterResourcesSettings
            clusterRegion="us-east-1"
            fromDetail={false}
            cloudProvider={CloudProviderEnum.AWS}
          />
          <FormValuesProbe />
        </>,
        {
          defaultValues: {
            ...defaultValues,
            karpenter: {
              enabled: true,
              spot_enabled: false,
              disk_size_in_gib: 50,
              default_service_architecture: 'AMD64',
              qovery_node_pools: { requirements: creationRequirements },
            },
          },
        }
      )
    )

    await userEvent.click(screen.getByRole('switch', { name: 'Enable cronjob nodepools' }))

    expect(
      JSON.parse(screen.getByTestId('karpenter-values').textContent ?? '{}').qovery_node_pools.cronjob_override
    ).toEqual({})
  })

  it('should not render Karpenter section for non-AWS providers', () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <ClusterResourcesSettings clusterRegion="fr-par" fromDetail={false} cloudProvider={CloudProviderEnum.SCW} />,
        { defaultValues }
      )
    )

    expect(screen.queryByText('Reduce your costs with Karpenter')).not.toBeInTheDocument()
  })
})
