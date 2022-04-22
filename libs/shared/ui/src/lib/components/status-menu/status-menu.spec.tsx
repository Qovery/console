import { render } from '@testing-library/react'

import StatusMenu from './status-menu'

describe('StatusMenu', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StatusMenu />)
    expect(baseElement).toBeTruthy()
  })
})
