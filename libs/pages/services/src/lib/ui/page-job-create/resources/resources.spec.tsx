import { render } from '__tests__/utils/setup-jest'
import Resources from './resources'

describe('Resources', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Resources />)
    expect(baseElement).toBeTruthy()
  })
})
