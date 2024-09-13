import { render } from '@testing-library/react'
import ServiceLogsToolbar from './service-logs-toolbar'

describe('ServiceLogsToolbar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ServiceLogsToolbar />)
    expect(baseElement).toBeTruthy()
  })
})
