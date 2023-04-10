import { render } from '__tests__/utils/setup-jest'
import PodLogsFeature, { PodLogsFeatureProps } from './pod-logs-feature'

describe('PodLogsFeature', () => {
  const props: PodLogsFeatureProps = {
    clusterId: '1',
    setServiceId: jest.fn(),
  }

  it('should render successfully', () => {
    const { baseElement } = render(<PodLogsFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
