import { render } from '@testing-library/react'
import RowServiceLogs from './row-service-logs'

describe('RowServiceLogs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RowServiceLogs />)
    expect(baseElement).toBeTruthy()
  })
})
