import { renderWithProviders } from '@qovery/shared/util-tests'
import MenuAccountFeature from './menu-account-feature'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
}))

describe('MenuAccountFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<MenuAccountFeature />)
    expect(baseElement).toBeTruthy()
  })
})
