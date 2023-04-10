import { render } from '__tests__/utils/setup-jest'
import DeploymentLogsFeature, { DeploymentLogsFeatureProps } from './deployment-logs-feature'

describe('DeploymentLogsFeature', () => {
  const props: DeploymentLogsFeatureProps = {
    clusterId: '1',
    setServiceId: jest.fn(),
  }

  it('should render successfully', () => {
    const { baseElement } = render(<DeploymentLogsFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
