import { render } from '@testing-library/react'
import CustomFilter from './custom-filter'

describe('CustomFilter', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CustomFilter />)
    expect(baseElement).toBeTruthy()
  })
})
