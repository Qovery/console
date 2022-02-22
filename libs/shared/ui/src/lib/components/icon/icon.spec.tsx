import { render } from '__tests__/test-utils'
import Icon from './icon'

describe('Icon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Icon />)
    expect(baseElement).toBeTruthy()
  })
})
