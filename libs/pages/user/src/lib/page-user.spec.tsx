import { renderWithProviders } from '@qovery/shared/util-tests'
import PagesUser from './pages-user'

describe('PagesUser', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PagesUser />)
    expect(baseElement).toBeTruthy()
  })
})
