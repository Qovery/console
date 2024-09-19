import { render } from '@testing-library/react'
import RowDeployment from './row-deployment'

describe('RowDeployment', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RowDeployment />)
    expect(baseElement).toBeTruthy()
  })
})
