import { render } from '__tests__/utils/setup-jest'
import { userSignUpFactoryMock } from '@qovery/shared/factories'
import Container, { ContainerProps } from '../container/container'

describe('Container', () => {
  const props: ContainerProps = {
    user: userSignUpFactoryMock(),
    application: {
      id: '',
      created_at: '',
    },
  }

  it('should render successfully', () => {
    const { baseElement } = render(<Container {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
