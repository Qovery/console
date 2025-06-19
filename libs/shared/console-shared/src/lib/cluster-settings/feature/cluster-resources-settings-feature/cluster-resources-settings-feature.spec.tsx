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
})
