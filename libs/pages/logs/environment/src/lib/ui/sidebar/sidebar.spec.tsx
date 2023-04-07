import { render } from '__tests__/utils/setup-jest'
import Sidebar from './sidebar/sidebar'

describe('Sidebar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Sidebar />)
    expect(baseElement).toBeTruthy()
  })
})
