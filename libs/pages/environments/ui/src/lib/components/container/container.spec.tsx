import { userSignUpFactoryMock } from '@console/domains/user'
import { render } from '__tests__/utils/setup-jest'

import Container, { ContainerProps } from '../container/container'

describe('Container', () => {
  const props: ContainerProps = {
    authLogout: Function,
    user: userSignUpFactoryMock(),
    environments: [],
  }

  it('should render successfully', () => {
    const { baseElement } = render(<Container {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
