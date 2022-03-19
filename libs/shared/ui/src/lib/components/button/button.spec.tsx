import React from 'react'
import { render } from '__tests__/utils/setup-jest'

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
