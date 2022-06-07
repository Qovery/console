import { render } from '__tests__/utils/setup-jest'
import ServicesPage from './services-page'

describe('ServicesPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ServicesPage />)
    expect(baseElement).toBeTruthy()
  })
})
