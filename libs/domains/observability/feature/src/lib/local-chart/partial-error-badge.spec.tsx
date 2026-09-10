import { renderWithProviders } from '@qovery/shared/util-tests'
import { PartialErrorBadge } from './partial-error-badge'

describe('PartialErrorBadge', () => {
  it('should render successfully', () => {
    const { getByText } = renderWithProviders(<PartialErrorBadge />)

    expect(getByText('Partial data')).toBeInTheDocument()
  })
})
