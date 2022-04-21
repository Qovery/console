import { render } from '__tests__/utils/setup-jest'

import Container, { ContainerProps } from '../container/container'

describe('Container', () => {
  const props: ContainerProps = {
    applications: [],
  }

  it('should render successfully', () => {
    const { baseElement } = render(<Container {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
