import { render } from '__tests__/utils/setup-jest'
import PageServices from './page-services'

describe('ServicesPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageServices />)
    expect(baseElement).toBeTruthy()
  })
})
