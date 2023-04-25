import { render } from '@testing-library/react'
import PageEvents from './page-events'

describe('PageEvents', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageEvents />)
    expect(baseElement).toBeTruthy()
  })
})
