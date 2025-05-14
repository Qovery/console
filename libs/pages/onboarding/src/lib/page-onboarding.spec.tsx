import { renderWithProviders } from '@qovery/shared/util-tests'
import PageOnboarding from './page-onboarding'

describe('PageOnboarding', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOnboarding />)
    expect(baseElement).toBeTruthy()
  })
})
