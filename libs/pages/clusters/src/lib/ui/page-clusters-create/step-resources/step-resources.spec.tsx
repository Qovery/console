import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { ClusterResourcesData } from '@qovery/shared/interfaces'
import StepResources, { StepResourcesProps } from './step-resources'

describe('StepResources', () => {
  let defaultValues: ClusterResourcesData
  let props: StepResourcesProps

  beforeEach(() => {
    defaultValues = {
      instance_type: 't3.medium',
      disk_size: 20,
      cluster_type: 'MANAGED',
      nodes: [1, 3],
    }

    props = {
      onSubmit: jest.fn(),
      clusterRegion: 'us-east-1',
      cloudProvider: CloudProviderEnum.AWS,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<ClusterResourcesData>(<StepResources {...props} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })
})
