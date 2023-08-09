import { render } from '__tests__/utils/setup-jest'
import Header from './header'

describe('Header', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Header />)
    expect(baseElement).toBeTruthy()
  })
})
