import { render } from '__tests__/utils/setup-jest'

import Container from './container'

describe('Container', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Container>Content</Container>)
    expect(baseElement).toBeTruthy()
  })
})
