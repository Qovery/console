import { render } from '@testing-library/react'
import InputTags from './input-tags'

describe('InputTags', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputTags />)
    expect(baseElement).toBeTruthy()
  })
})
