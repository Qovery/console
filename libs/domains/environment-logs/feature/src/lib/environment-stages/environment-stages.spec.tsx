import { render } from '@testing-library/react'
import EnvironmentStages from './environment-stages'

describe('EnvironmentStages', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EnvironmentStages />)
    expect(baseElement).toBeTruthy()
  })
})
