import { render } from '@testing-library/react'

import MenuItem, { MenuItemProps } from './menu-item'

let props: MenuItemProps

beforeEach(() => {
  props = {
    name: 'Test',
    link: '/',
  }
})
