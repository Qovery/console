import { render } from '__tests__/utils/setup-jest'
import Container, { ContainerProps } from './container'

describe('Container', () => {
  const props: ContainerProps = {
    userLinks: [],
    children: <p>hello</p>,
  }

  it('should render successfully', () => {
    const { baseElement } = render(<Container {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
