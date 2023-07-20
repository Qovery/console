import { render } from '__tests__/utils/setup-jest'
import CustomFilterFeature, { CustomFilterFeatureProps } from './custom-filter-feature'

describe('CustomFilterFeature', () => {
  const props: CustomFilterFeatureProps = {
    handleClearFilter: jest.fn(),
  }

  it('should render successfully', () => {
    render(<CustomFilterFeature {...props} />)
  })
})
