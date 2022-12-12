import { render } from '__tests__/utils/setup-jest'
import Tooltip from './tooltip'

describe('Tooltip', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Tooltip />)
    expect(baseElement).toBeTruthy()
  })
})
