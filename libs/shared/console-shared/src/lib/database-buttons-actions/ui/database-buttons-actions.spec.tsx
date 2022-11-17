import { render } from '@testing-library/react'
import DatabaseButtonsActions from './database-buttons-actions'

describe('DatabaseButtonsActions', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DatabaseButtonsActions />)
    expect(baseElement).toBeTruthy()
  })
})
