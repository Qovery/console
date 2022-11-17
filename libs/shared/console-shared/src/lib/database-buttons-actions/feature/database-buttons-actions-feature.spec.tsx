import { render } from '@testing-library/react'
import DatabaseButtonsActionsFeature from './database-buttons-actions-feature'

describe('DatabaseButtonsActionsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DatabaseButtonsActionsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
