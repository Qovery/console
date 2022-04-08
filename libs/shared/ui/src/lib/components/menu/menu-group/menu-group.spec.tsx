import { render } from '__tests__/utils/setup-jest'
import { screen } from '@testing-library/react'

import MenuGroup, { MenuGroupProps } from './menu-group'

let props: MenuGroupProps

beforeEach(() => {
  props = {
    menu: [
      { name: 'Test 1', link: '/' },
      { name: 'Test 2', link: '/' },
      { name: 'Test 3', link: '/' },
    ],
    isLast: true,
  }
})

describe('MenuGroup', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MenuGroup {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
