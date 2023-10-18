import { render } from '@testing-library/react'
import UseSuggestions from './use-suggestions'

describe('UseSuggestions', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UseSuggestions />)
    expect(baseElement).toBeTruthy()
  })
})
