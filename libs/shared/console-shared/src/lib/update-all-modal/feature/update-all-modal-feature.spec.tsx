import { render } from '@testing-library/react'
import UpdateAllModalFeature from './update-all-modal-feature'

describe('UpdateAllModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UpdateAllModalFeature />)
    expect(baseElement).toBeTruthy()
  })
})
