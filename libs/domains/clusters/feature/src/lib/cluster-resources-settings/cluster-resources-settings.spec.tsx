import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterResourcesSettings } from './cluster-resources-settings'

jest.mock('@qovery/domains/cloud-providers/feature', () => ({
  ...jest.requireActual('@qovery/domains/cloud-providers/feature'),
  useCloudProviderInstanceTypes: () => ({
    data: [
      { name: 't3.medium', cpu: 2, ram_in_gb: 4, architecture: 'AMD64', type: 't3.medium' },
      { name: 't4g.medium', cpu: 2, ram_in_gb: 4, architecture: 'ARM64', type: 't4g.medium' },
    ],
  }),
  useCloudProviderInstanceTypesKarpenter: () => ({ data: [] }),
  ClusterSCWControlPlaneFeature: () => <div data-testid="scw-control-plane">SCW Control Plane</div>,
  KarpenterInstanceFilterModal: () => null,
  KarpenterInstanceTypePreview: () => <div data-testid="karpenter-preview">Karpenter Preview</div>,
  convertToKarpenterRequirements: () => [],
}))

jest.mock('../gpu-resources-settings/gpu-resources-settings', () => ({
  GpuResourcesSettings: () => <div data-testid="gpu-resources-settings">GPU Settings</div>,
}))

jest.mock('../nodepools-resources-settings/nodepools-resources-settings', () => ({
  NodepoolsResourcesSettings: () => <div data-testid="nodepools-settings">Nodepools Settings</div>,
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: jest.fn(),
    closeModal: jest.fn(),
  }),
}))

const defaultValues: ClusterResourcesData = {
  instance_type: 't3.medium',
  disk_size: 50,
  cluster_type: 'MANAGED',
  nodes: [3, 10],
}

describe('ClusterResourcesSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
