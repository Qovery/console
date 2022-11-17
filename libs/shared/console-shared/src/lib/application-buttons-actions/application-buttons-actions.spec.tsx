import { render } from '@testing-library/react'
import ApplicationButtonsActions from './application-buttons-actions'

describe('ApplicationButtonsActions', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ApplicationButtonsActions />)
    expect(baseElement).toBeTruthy()
  })
})
