import { render } from '@testing-library/react'
import JobOverview from './job-overview'

describe('JobOverview', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<JobOverview />)
    expect(baseElement).toBeTruthy()
  })
})
