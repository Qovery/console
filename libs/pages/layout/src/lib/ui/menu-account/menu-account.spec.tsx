import { render } from '@testing-library/react'
import MenuAccount from './menu-account'

describe('MenuAccount', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MenuAccount />)
    expect(baseElement).toBeTruthy()
  })
})
