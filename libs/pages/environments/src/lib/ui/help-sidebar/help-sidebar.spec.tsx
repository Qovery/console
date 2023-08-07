import { render } from '__tests__/utils/setup-jest'
import HelpSidebar from './help-sidebar'

describe('HelpSidebar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<HelpSidebar />)
    expect(baseElement).toBeTruthy()
  })
})
