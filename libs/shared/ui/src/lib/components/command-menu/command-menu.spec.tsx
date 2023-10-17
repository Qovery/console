import { render } from '@testing-library/react'
import CommandMenu from './command-menu'

describe('CommandMenu', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CommandMenu />)
    expect(baseElement).toBeTruthy()
  })
})
