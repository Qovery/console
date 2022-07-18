import { render } from '__tests__/utils/setup-jest'
import PageSettings from './page-settings'

describe('PageSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettings />)
    expect(baseElement).toBeTruthy()
  })
})
