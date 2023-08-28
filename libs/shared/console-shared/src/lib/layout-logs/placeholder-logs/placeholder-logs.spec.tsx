import { render } from '@testing-library/react'
import PlaceholderLogs from './placeholder-logs'

describe('PlaceholderLogs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PlaceholderLogs />)
    expect(baseElement).toBeTruthy()
  })
})
