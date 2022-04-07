import { render } from '@testing-library/react'

import MenuItem, { MenuItemProps } from './menu-item'

let props: MenuItemProps

beforeEach(() => {
  props = {
    name: 'Test',
    link: '/',
  }
})

describe('MenuItem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MenuItem {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
