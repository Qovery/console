import { render } from '@testing-library/react'
import ForceRunModal from './force-run-modal'

describe('ForceRunModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ForceRunModal />)
    expect(baseElement).toBeTruthy()
  })
})
