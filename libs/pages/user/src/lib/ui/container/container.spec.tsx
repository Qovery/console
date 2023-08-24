import { renderWithProviders } from '@qovery/shared/util-tests'
import Container, { type ContainerProps } from './container'

describe('Container', () => {
  const props: ContainerProps = {
    userLinks: [],
    children: <p>hello</p>,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Container {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
