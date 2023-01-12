import { render } from '__tests__/utils/setup-jest'
import React from 'react'
import Container, { ContainerProps } from './container'

describe('Container', () => {
  let props: ContainerProps

  beforeEach(() => {
    props = {
      children: React.createElement('div'),
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
