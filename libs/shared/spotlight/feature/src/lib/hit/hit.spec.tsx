import { render } from '@testing-library/react'
import Hit from './hit'

describe('Hit', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Hit />)
    expect(baseElement).toBeTruthy()
  })
})
