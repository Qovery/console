import { render } from '__tests__/utils/setup-jest'
import { deploymentStagesFactoryMock } from '@qovery/shared/factories'
import StageOrderModalFeature, { type StageOrderModalFeatureProps } from './stage-order-modal-feature'

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
