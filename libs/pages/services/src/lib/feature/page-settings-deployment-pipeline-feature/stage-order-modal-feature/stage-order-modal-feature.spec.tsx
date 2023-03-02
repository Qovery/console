import { render } from '__tests__/utils/setup-jest'
import { deploymentStagesFactoryMock } from '@qovery/shared/factories'
import StageOrderModalFeature, { StageOrderModalFeatureProps } from './stage-order-modal-feature'

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

describe('StageOrderModalFeature', () => {
  const props: StageOrderModalFeatureProps = {
    onClose: jest.fn(),
    stages: deploymentStagesFactoryMock(3),
  }

  it('should render successfully', () => {
    const { baseElement } = render(<StageOrderModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
