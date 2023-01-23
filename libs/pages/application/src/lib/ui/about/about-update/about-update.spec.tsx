import { render } from '@testing-library/react'
import AboutUpdate from './about-update'

describe('AboutUpdate', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AboutUpdate />)
    expect(baseElement).toBeTruthy()
  })
})
