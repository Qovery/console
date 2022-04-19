import { userSignUpFactoryMock } from '@console/domains/user'
import { render } from '@testing-library/react'

import Container, { ContainerProps } from '../container/container'

describe('Container', () => {
  const props: ContainerProps = {
    authLogout: Function,
    user: userSignUpFactoryMock(),
  }

  it('should render successfully', () => {
    const { baseElement } = render(<Container {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
