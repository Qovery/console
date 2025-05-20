import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ClusterResourcesSettingsFeature from './cluster-resources-settings-feature'

describe('ClusterResourcesSettingsFeature', () => {
  let defaultValues: ClusterResourcesData
  beforeEach(() => {
    defaultValues = {
      instance_type: 't3.medium',
      disk_size: 50,
      cluster_type: 'MANAGED',
      nodes: [1, 3],
    }
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <ClusterResourcesSettingsFeature
          clusterRegion="us-east-2"
          fromDetail={false}
          cloudProvider={CloudProviderEnum.AWS}
        />,
        {
          defaultValues,
        }
      )
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render two cluster type options if aws', () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <ClusterResourcesSettingsFeature
          clusterRegion="us-east-2"
          fromDetail={false}
          cloudProvider={CloudProviderEnum.AWS}
        />,
        {
          defaultValues,
        }
      )
    )
    screen.getByText('Managed K8S (EKS)')
  })

  it('should render one cluster type option if scw', () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <ClusterResourcesSettingsFeature
          clusterRegion="us-east-2"
          fromDetail={false}
          cloudProvider={CloudProviderEnum.SCW}
        />,
        {
          defaultValues,
        }
      )
    )
    screen.getByText('Managed K8S (KAPSULE)')
  })

  it('should render one cluster type option if gcp', () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <ClusterResourcesSettingsFeature
          clusterRegion="europe-west9"
          fromDetail={false}
          cloudProvider={CloudProviderEnum.GCP}
        />,
        {
          defaultValues,
        }
      )
    )
    screen.getByText('Managed K8S (GKE with Autopilot)')
  })

  it('should render one cluster type option if azure', () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <ClusterResourcesSettingsFeature
          clusterRegion="francecental"
          fromDetail={false}
          cloudProvider={CloudProviderEnum.AZURE}
        />,
        {
          defaultValues,
        }
      )
    )
    screen.getByText('Managed K8S (AKS)')
  })

  it('should select first cluster option at initialisation', () => {
    renderWithProviders(
      wrapWithReactHookForm<ClusterResourcesData>(
        <ClusterResourcesSettingsFeature
          clusterRegion="us-east-2"
          fromDetail={false}
          cloudProvider={CloudProviderEnum.AWS}
        />,
        {
          defaultValues,
        }
      )
    )
    const checkbox = screen.getByLabelText('Managed K8S (EKS)')
    expect(checkbox).toBeChecked()
  })
})
