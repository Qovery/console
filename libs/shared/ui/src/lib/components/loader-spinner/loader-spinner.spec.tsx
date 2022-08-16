import { render } from '@testing-library/react'
import LoaderSpinner from './loader-spinner'

describe('LoaderSpinner', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LoaderSpinner />)
    expect(baseElement).toBeTruthy()
  })
})
