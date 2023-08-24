import { render } from '__tests__/utils/setup-jest'
import { environmentFactoryMock } from '@qovery/shared/factories'
import Container, { type ContainerProps } from '../container/container'

describe('Container', () => {
  const props: ContainerProps = {
    environment: environmentFactoryMock(1)[0],
    statusActions: [
      {
        name: 'action',
        action: jest.fn(),
      },
    ],
    children: <p></p>,
  }

  it('should render successfully', () => {
    const { baseElement } = render(<Container {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
