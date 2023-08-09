import { act, getByLabelText, getByText, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum, KubernetesEnum } from 'qovery-typescript-axios'
import * as storeOrganization from '@qovery/domains/organization'
import { ClusterResourcesData } from '@qovery/shared/interfaces'
import ClusterResourcesSettingsFeature from './cluster-resources-settings-feature'

import SpyInstance = jest.SpyInstance

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
    getByText(baseElement, 'BETA - Single EC2 (K3S)')
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

  it('should fetch the availabale Instance types at init and on change', async () => {
    const editProjectSpy: SpyInstance = jest.spyOn(storeOrganization, 'fetchAvailableInstanceTypes')

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

    expect(editProjectSpy).toHaveBeenCalledWith({ clusterType: 'MANAGED', provider: 'AWS', region: 'us-east-2' })

    const checkbox = getByText(baseElement, 'BETA - Single EC2 (K3S)')
    await act(() => {
      checkbox.click()
    })

    expect(editProjectSpy).toHaveBeenCalledWith({
      clusterType: KubernetesEnum.K3_S,
      provider: 'AWS',
      region: 'us-east-2',
    })
  })
})
