import { createElement } from 'react'
import { renderWithProviders } from '@qovery/shared/util-tests'
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
    const { baseElement } = renderWithProviders(<Container {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
