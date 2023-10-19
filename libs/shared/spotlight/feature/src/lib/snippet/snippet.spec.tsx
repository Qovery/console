import { render } from '@testing-library/react'
import Snippet from './snippet'

describe('Snippet', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Snippet />)
    expect(baseElement).toBeTruthy()
  })
})
