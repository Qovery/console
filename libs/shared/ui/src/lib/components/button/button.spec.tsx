import React from 'react'
import { render } from '__tests__/test-utils'
import Button from './button'
import { MemoryRouter } from 'react-router-dom'

describe('Button', () => {
  it('should render successfully', () => {
    const children = React.createElement('div')

    render(<Button children={children} />)

    // expect(baseElement).toBeTruthy()
  })
})
