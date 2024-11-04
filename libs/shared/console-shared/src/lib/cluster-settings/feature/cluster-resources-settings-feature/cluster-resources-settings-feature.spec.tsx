import { getByLabelText, getByText, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
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
    const { baseElement } = render(
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
    const { baseElement } = render(
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
    getByText(baseElement, 'Managed K8S (EKS)')
  })

  it('should render one cluster type option if scw', () => {
    const { baseElement } = render(
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
    getByText(baseElement, 'Managed K8S (KAPSULE)')
  })

  it('should render one cluster type option if gcp', () => {
    const { baseElement } = render(
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
    getByText(baseElement, 'Managed K8S (GKE with Autopilot)')
  })

  it('should select first cluster option at initialisation', () => {
    const { baseElement } = render(
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
    const checkbox = getByLabelText(baseElement, 'Managed K8S (EKS)')
    expect(checkbox).toBeChecked()
  })
})
