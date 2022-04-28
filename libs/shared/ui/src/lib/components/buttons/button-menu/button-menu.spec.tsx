import { render } from '@testing-library/react'

import ButtonMenu from './button-menu'

describe('ButtonMenu', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ButtonMenu />)
    expect(baseElement).toBeTruthy()
  })
})
