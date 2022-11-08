import { render } from '@testing-library/react'
import UseModalAlert from './use-modal-alert'

describe('UseModalAlert', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UseModalAlert />)
    expect(baseElement).toBeTruthy()
  })
})
