import { render } from '@testing-library/react'

import MenuGroup from './menu-group'

describe('MenuGroup', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MenuGroup />)
    expect(baseElement).toBeTruthy()
  })
})
