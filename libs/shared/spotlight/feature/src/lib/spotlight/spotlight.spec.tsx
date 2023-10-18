import { render } from '@testing-library/react'
import Spotlight from './spotlight'

describe('Spotlight', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Spotlight />)
    expect(baseElement).toBeTruthy()
  })
})
