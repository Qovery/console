import { render } from '@testing-library/react'
import EnvironmentButtonsActions from './environment-buttons-actions'

describe('EnvironmentButtonsActions', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EnvironmentButtonsActions />)
    expect(baseElement).toBeTruthy()
  })
})
