import { render } from '__tests__/utils/setup-jest'
import { createElement } from 'react'
import Container, { type ContainerProps } from './container'

describe('Container', () => {
  let props: ContainerProps

  beforeEach(() => {
    props = {
      children: createElement('div'),
      params: {
        '*': 'some-value',
      },
      firstStep: true,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<Container {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
