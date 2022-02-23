import React from 'react'
import { render } from '__mocks__/utils/test-utils'

import Button from './button'

describe('Button', () => {
  const props = {
    children: React.createElement('div'),
  }

  it('should render successfully', () => {
    const { baseElement } = render(<Button children={props.children} />)
    expect(baseElement).toBeTruthy()
  })
})
