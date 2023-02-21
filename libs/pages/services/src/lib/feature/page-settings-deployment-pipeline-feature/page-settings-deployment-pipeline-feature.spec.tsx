import { render } from '__tests__/utils/setup-jest'
import PageSettingsDeploymentPipelineFeature from './page-settings-deployment-pipeline-feature'

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

describe('PageSettingsDeploymentPipelineFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsDeploymentPipelineFeature />)
    expect(baseElement).toBeTruthy()
  })
})
