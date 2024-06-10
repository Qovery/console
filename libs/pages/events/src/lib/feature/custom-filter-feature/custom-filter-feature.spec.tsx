import { renderWithProviders } from '@qovery/shared/util-tests'
import CustomFilterFeature, { type CustomFilterFeatureProps } from './custom-filter-feature'

describe('CustomFilterFeature', () => {
  const props: CustomFilterFeatureProps = {
    handleClearFilter: jest.fn(),
  }

  it('should render successfully', () => {
    renderWithProviders(<CustomFilterFeature {...props} />)
  })
})
