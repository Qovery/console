import { render } from '__tests__/utils/setup-jest'
import Variable from './variable'

describe('Variable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Variable />)
    expect(baseElement).toBeTruthy()
  })
})
