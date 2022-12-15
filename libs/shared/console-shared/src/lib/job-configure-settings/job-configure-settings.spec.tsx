import { render } from '@testing-library/react'
import JobConfigureSettings from './job-configure-settings'

describe('JobConfigureSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<JobConfigureSettings />)
    expect(baseElement).toBeTruthy()
  })
})
