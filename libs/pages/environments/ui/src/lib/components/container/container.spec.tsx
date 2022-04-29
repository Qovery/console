import { environmentFactoryMock } from '@console/domains/environment'
import { render } from '__tests__/utils/setup-jest'

import Container, { ContainerProps } from '../container/container'

describe('Container', () => {
  const props: ContainerProps = {
    environments: environmentFactoryMock(2),
  }

  it('should render successfully', () => {
    const { baseElement } = render(<Container {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
