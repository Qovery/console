import { render } from '@testing-library/react'
import ApplicationButtonsActionsFeature from './application-buttons-actions-feature'

describe('ApplicationButtonsActionsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ApplicationButtonsActionsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
