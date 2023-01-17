import { render } from '@testing-library/react'
import ForceRunModalFeature from './force-run-modal-feature'

describe('ForceRunModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ForceRunModalFeature />)
    expect(baseElement).toBeTruthy()
  })
})
