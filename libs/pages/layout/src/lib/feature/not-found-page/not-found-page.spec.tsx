import { renderWithProviders } from '@qovery/shared/util-tests'
import { NotFoundPage } from './not-found-page'

describe('NotFoundPage', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<NotFoundPage />)
    expect(baseElement).toBeTruthy()
  })
})
