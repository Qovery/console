import { render } from '@testing-library/react'
import AboutContainer from './about-container'

describe('AboutContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AboutContainer />)
    expect(baseElement).toBeTruthy()
  })
})
