import { render } from '@testing-library/react'
import ListDeploymentLogs from './list-deployment-logs'

describe('ListDeploymentLogs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ListDeploymentLogs />)
    expect(baseElement).toBeTruthy()
  })
})
